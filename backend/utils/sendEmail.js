const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // For development, log emails to console
    return {
      sendMail: async (options) => {
        console.log('📧 Email would be sent:');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Content: ${options.html || options.text}`);
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email function
const sendEmail = async (options) => {
  const transporter = createTransporter();

  let htmlContent = '';

  // Simple email templates
  switch (options.template) {
    case 'orderConfirmation':
      htmlContent = generateOrderConfirmationHTML(options.data);
      break;
    case 'statusUpdate':
      htmlContent = generateStatusUpdateHTML(options.data);
      break;
    case 'welcome':
      htmlContent = generateWelcomeHTML(options.data);
      break;
    default:
      htmlContent = options.html || `<p>${options.text}</p>`;
  }

  const mailOptions = {
    from: `"FreshWash Laundry" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw error;
  }
};

// Email template generators
const generateOrderConfirmationHTML = (data) => {
  const itemsHTML = data.orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.service.name} (${item.serviceType})
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${item.subtotal}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">FreshWash Laundry</h1>
          <p style="margin: 5px 0;">Clean Clothes, Happy You</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Order Confirmation</h2>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for your order! We've received your laundry request and will process it shortly.</p>
          
          <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="padding: 10px; text-align: left;">Service</th>
                  <th style="padding: 10px; text-align: center;">Quantity</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
                <tr style="background: #f0f0f0; font-weight: bold;">
                  <td colspan="2" style="padding: 15px;">Total Amount</td>
                  <td style="padding: 15px; text-align: right;">₹${data.totalPrice}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Delivery Address</h3>
            <p>
              ${data.shippingAddress.name}<br>
              ${data.shippingAddress.street}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.zipCode}
            </p>
          </div>

          <div style="background: #e7f3ff; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>What's Next?</h3>
            <ul>
              <li>We'll pick up your items within 24 hours</li>
              <li>Your clothes will be professionally cleaned</li>
              <li>We'll deliver them back fresh and clean</li>
              <li>You'll receive updates via email</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p>Questions? Contact us at <a href="mailto:support@freshwash.com">support@freshwash.com</a> or call +91 98765 43210</p>
          </div>

          <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            <p>&copy; 2024 FreshWash Laundry. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateStatusUpdateHTML = (data) => {
  const statusMessages = {
    'confirmed': 'Your order has been confirmed and is being prepared.',
    'in-progress': 'Your items are currently being cleaned.',
    'completed': 'Your order is ready! We\'ll deliver it shortly.',
    'cancelled': 'Your order has been cancelled.'
  };

  const statusColors = {
    'confirmed': '#3b82f6',
    'in-progress': '#f59e0b',
    'completed': '#10b981',
    'cancelled': '#ef4444'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">FreshWash Laundry</h1>
          <p style="margin: 5px 0;">Clean Clothes, Happy You</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Order Status Update</h2>
          <p>Dear ${data.customerName},</p>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
            <h3>Order #${data.orderNumber}</h3>
            <div style="background: ${statusColors[data.newStatus]}; color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h2 style="margin: 0; text-transform: uppercase;">${data.newStatus}</h2>
            </div>
            <p style="font-size: 16px;">${statusMessages[data.newStatus]}</p>
          </div>

          ${data.newStatus === 'completed' ? `
            <div style="background: #e7f3ff; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>🎉 Your Order is Ready!</h3>
              <p>Your freshly cleaned items are ready for delivery. We'll contact you shortly to arrange the delivery time.</p>
            </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.orderUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order Details</a>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p>Questions? Contact us at <a href="mailto:support@freshwash.com">support@freshwash.com</a> or call +91 98765 43210</p>
          </div>

          <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            <p>&copy; 2024 FreshWash Laundry. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateWelcomeHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to FreshWash</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Welcome to FreshWash Laundry!</h1>
          <p style="margin: 5px 0;">Clean Clothes, Happy You</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${data.customerName}! 👋</h2>
          <p>Welcome to FreshWash Laundry! We're excited to have you as part of our family.</p>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3>What makes us special?</h3>
            <ul>
              <li>🚚 Free pickup and delivery</li>
              <li>⚡ 24-48 hour turnaround</li>
              <li>🧼 Premium eco-friendly cleaning</li>
              <li>👔 Professional pressing service</li>
              <li>📱 Easy online booking</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/services" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Browse Our Services</a>
          </div>

          <div style="background: #e7f3ff; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Ready to get started?</h3>
            <p>Schedule your first pickup and experience the convenience of professional laundry service!</p>
          </div>

          <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            <p>&copy; 2024 FreshWash Laundry. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { sendEmail };