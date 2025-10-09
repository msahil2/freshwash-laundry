const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/sendEmail');

// @desc    Create new contact message
// @route   POST /api/contact
// @access  Public
const createContact = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { name, email, phone, subject, message, category, priority } = req.body;

  const contact = await Contact.create({
    name,
    email,
    phone,
    subject,
    message,
    category: category || 'general',
    priority: priority || 'medium',
    user: req.user ? req.user._id : null
  });

  // Send acknowledgment email
  try {
    await sendEmail({
      to: email,
      subject: 'We received your message - FreshWash Laundry',
      template: 'contactAcknowledgment',
      data: {
        customerName: name,
        subject,
        message: message.substring(0, 100) + '...',
        contactId: contact._id
      }
    });
  } catch (error) {
    console.error('Failed to send acknowledgment email:', error);
  }

  // Notify admin of new contact
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `New Contact Message: ${subject}`,
      html: `
        <h3>New Contact Message Received</h3>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Priority:</strong> ${priority}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p>Contact ID: ${contact._id}</p>
        <p>Received: ${new Date().toLocaleString()}</p>
      `
    });
  } catch (error) {
    console.error('Failed to notify admin:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Contact message sent successfully',
    contact: {
      _id: contact._id,
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      status: contact.status,
      createdAt: contact.createdAt
    }
  });
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, category, search } = req.query;
  
  let query = {};
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
  if (category && category !== 'all') {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } }
    ];
  }

  const contacts = await Contact.find(query)
    .populate('user', 'name email')
    .populate('readBy', 'name')
    .populate('response.respondedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Contact.countDocuments(query);

  // Get contact statistics
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
      }
    }
  ]);

  res.json({
    success: true,
    contacts,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total,
    stats: stats[0] || { total: 0, new: 0, inProgress: 0, resolved: 0, unread: 0 }
  });
});

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('readBy', 'name email')
    .populate('response.respondedBy', 'name email');

  if (contact) {
    // Mark as read
    if (!contact.isRead) {
      contact.isRead = true;
      contact.readAt = Date.now();
      contact.readBy = req.user._id;
      await contact.save();
    }

    res.json({
      success: true,
      contact
    });
  } else {
    res.status(404);
    throw new Error('Contact message not found');
  }
});

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateContact = asyncHandler(async (req, res) => {
  const { status, priority } = req.body;
  const contact = await Contact.findById(req.params.id);

  if (contact) {
    contact.status = status || contact.status;
    contact.priority = priority || contact.priority;

    const updatedContact = await contact.save();
    await updatedContact.populate('user', 'name email');

    res.json({
      success: true,
      contact: updatedContact
    });
  } else {
    res.status(404);
    throw new Error('Contact message not found');
  }
});

// @desc    Respond to contact message
// @route   PUT /api/contact/:id/respond
// @access  Private/Admin
const respondToContact = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const contact = await Contact.findById(req.params.id).populate('user', 'name email');

  if (contact) {
    contact.response = {
      message,
      respondedAt: Date.now(),
      respondedBy: req.user._id
    };
    contact.status = 'resolved';

    const updatedContact = await contact.save();

    // Send response email to customer
    try {
      await sendEmail({
        to: contact.email,
        subject: `Response to: ${contact.subject} - FreshWash Laundry`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
              <h1>FreshWash Laundry</h1>
              <p>Response to Your Message</p>
            </div>
            
            <div style="padding: 20px;">
              <p>Dear ${contact.name},</p>
              
              <p>Thank you for contacting us. Here's our response to your message:</p>
              
              <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <h3>Your Original Message:</h3>
                <p><strong>Subject:</strong> ${contact.subject}</p>
                <p>${contact.message}</p>
              </div>

              <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
                <h3>Our Response:</h3>
                <p>${message}</p>
              </div>

              <p>If you have any further questions, please don't hesitate to contact us.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <p>Best regards,<br>FreshWash Laundry Team</p>
              </div>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error('Failed to send response email:', error);
    }

    res.json({
      success: true,
      contact: updatedContact
    });
  } else {
    res.status(404);
    throw new Error('Contact message not found');
  }
});

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (contact) {
    await contact.remove();
    res.json({
      success: true,
      message: 'Contact message removed'
    });
  } else {
    res.status(404);
    throw new Error('Contact message not found');
  }
});

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  respondToContact,
  deleteContact
};