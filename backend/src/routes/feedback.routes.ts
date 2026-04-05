import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  submitFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  deleteFeedback,
  getSummary,
  getAISummary,
  reanalyzeFeedback
} from '../controllers/feedback.controller';

const router = Router();

// 1.7 Rate limiting - prevent same IP from submitting more than 5 times per hour
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, error: 'Too many feedback submissions from this IP, please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public route
router.post('/', submitLimiter, submitFeedback);

// Protected routes (Admin only)
router.get('/', authenticateToken, getFeedback);
router.get('/summary', authenticateToken, getSummary);
router.get('/summary-ai', authenticateToken, getAISummary);
router.post('/:id/analyze', authenticateToken, reanalyzeFeedback);
router.get('/:id', authenticateToken, getFeedbackById);
router.patch('/:id', authenticateToken, updateFeedbackStatus);
router.delete('/:id', authenticateToken, deleteFeedback);

export default router;
