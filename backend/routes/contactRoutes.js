const express = require('express');
const { body } = require('express-validator');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  respondToContact
} = require('../controllers/contactController');

const router = express.Router();

// @route   POST /api/contact
router.post('/', [
  body('name', 'Name is required').notEmpty().trim(),
  body('email', 'Valid email is required').isEmail().normalizeEmail(),
  body('subject', 'Subject is required').notEmpty().trim(),
  body('message', 'Message is required').notEmpty().trim().isLength({ max: 1000 })
], createContact);

// @route   GET /api/contact
router.get('/', protect, admin, getContacts);

// @route   GET /api/contact/:id
router.get('/:id', protect, admin, getContactById);

// @route   PUT /api/contact/:id
router.put('/:id', protect, admin, updateContact);

// @route   DELETE /api/contact/:id
router.delete('/:id', protect, admin, deleteContact);

// @route   PUT /api/contact/:id/respond
router.put('/:id/respond', [
  protect,
  admin,
  body('message', 'Response message is required').notEmpty().trim()
], respondToContact);

module.exports = router;
