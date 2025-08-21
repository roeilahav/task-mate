import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { TaskController } from '../controllers/taskController';

const router = Router();
const taskController = new TaskController();

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/tasks
// @desc    Get all tasks for current user with filtering and pagination
// @access  Private
router.get('/', taskController.getTasks.bind(taskController));

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', taskController.createTask.bind(taskController));

// @route   GET /api/tasks/stats/overview
// @desc    Get task statistics for dashboard
// @access  Private
router.get('/stats/overview', taskController.getTaskStatistics.bind(taskController));

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', taskController.getTaskById.bind(taskController));

// @route   PUT /api/tasks/:id
// @desc    Update task by ID
// @access  Private
router.put('/:id', taskController.updateTask.bind(taskController));

// @route   DELETE /api/tasks/:id
// @desc    Delete task by ID
// @access  Private
router.delete('/:id', taskController.deleteTask.bind(taskController));

// @route   POST /api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private
router.post('/:id/complete', taskController.markTaskCompleted.bind(taskController));

// @route   POST /api/tasks/:id/incomplete
// @desc    Mark task as incomplete
// @access  Private
router.post('/:id/incomplete', taskController.markTaskIncomplete.bind(taskController));

export default router;