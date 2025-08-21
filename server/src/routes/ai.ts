import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AIController } from '../controllers/aiController';

const router = Router();
const aiController = new AIController();

// All AI routes require authentication
router.use(authenticateToken);

// @route   POST /api/ai/chat
// @desc    Chat with AI assistant
// @access  Private
router.post('/chat', aiController.chat.bind(aiController));

// @route   POST /api/ai/task-suggestions
// @desc    Get AI suggestions for task management
// @access  Private
router.post('/task-suggestions', aiController.getTaskSuggestions.bind(aiController));

// @route   POST /api/ai/daily-plan
// @desc    Get AI-generated daily plan
// @access  Private
router.post('/daily-plan', aiController.getDailyPlan.bind(aiController));

export default router;