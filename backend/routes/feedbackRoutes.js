const express = require('express');
const { body } = require('express-validator');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createFeedback,
  getFeedback,
  getFeedbackByService,
  updateFeedback,
  deleteFeedback,
  respondToFeedback
} = require('../controllers/feedbackController');

const router = express.Router();

// @route   POST /api/feedback
router.post('/', [
  protect,
  body('rating', 'Rating is required and must be between 1-5').isInt({ min: 1, max: 5 }),
  body('comment', 'Comment is required').notEmpty().trim().isLength({ max: 500 })
], createFeedback);

// @route   GET /api/feedback
router.get('/', getFeedback);

// @route   GET /api/feedback/service/:serviceId
router.get('/service/:serviceId', getFeedbackByService);

// @route   PUT /api/feedback/:id
router.put('/:id', protect, updateFeedback);

// @route   DELETE /api/feedback/:id
router.delete('/:id', protect, deleteFeedback);

// @route   PUT /api/feedback/:id/respond
router.put('/:id/respond', [
  protect,
  admin,
  body('message', 'Response message is required').notEmpty().trim()
], respondToFeedback);

module.exports = router;