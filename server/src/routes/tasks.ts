import { Router, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import Task from '../models/Task';
import { ApiResponse, CreateTaskRequest, UpdateTaskRequest, TaskQuery, PaginationInfo, ITask, AuthenticatedRequest } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/tasks
// @desc    Get all tasks for current user with filtering and pagination
// @access  Private
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const query: TaskQuery = req.query;

    // Build MongoDB query
    const mongoQuery: any = { userId };

    // Apply filters
    if (query.status) mongoQuery.status = query.status;
    if (query.priority) mongoQuery.priority = query.priority;
    if (query.category) mongoQuery.category = new RegExp(query.category, 'i');
    if (query.isCompleted !== undefined) mongoQuery.isCompleted = query.isCompleted === true;
    
    // Date filters
    if (query.dueBefore || query.dueAfter) {
      mongoQuery.dueDate = {};
      if (query.dueBefore) mongoQuery.dueDate.$lte = new Date(query.dueBefore);
      if (query.dueAfter) mongoQuery.dueDate.$gte = new Date(query.dueAfter);
    }

    // Tag filter
    if (query.tags) {
      mongoQuery.tags = { $in: query.tags.split(',').map(tag => tag.trim()) };
    }

    // Pagination
    const page = Math.max(1, parseInt(query.page as any as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as any as string) || 10));
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    // Execute query with pagination
    const [tasks, total] = await Promise.all([
      Task.find(mongoQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(mongoQuery)
    ]);

    // Pagination info
    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      data: { tasks },
      pagination
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const taskData: CreateTaskRequest = req.body;

    // Validate required fields
    if (!taskData.title || taskData.title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Task title is required'
      } as ApiResponse);
    }

    // Create task
    const task = new Task({
      ...taskData,
      userId,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);
    }

    res.status(200).json({
      success: true,
      data: { task }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task by ID
// @access  Private
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;
    const updateData: UpdateTaskRequest = req.body;

    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);
    }

    // Update fields
    if (updateData.title !== undefined) task.title = updateData.title;
    if (updateData.description !== undefined) task.description = updateData.description;
    if (updateData.priority !== undefined) task.priority = updateData.priority;
    if (updateData.status !== undefined) task.status = updateData.status;
    if (updateData.category !== undefined) task.category = updateData.category;
    if (updateData.tags !== undefined) task.tags = updateData.tags;
    if (updateData.isCompleted !== undefined) task.isCompleted = updateData.isCompleted;
    if (updateData.dueDate !== undefined) {
      task.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : undefined;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task by ID
// @access  Private
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private
router.post('/:id/complete', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId }) as ITask;

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);
    }

    await task.markCompleted();

    res.status(200).json({
      success: true,
      message: 'Task marked as completed',
      data: { task }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks/:id/incomplete
// @desc    Mark task as incomplete
// @access  Private
router.post('/:id/incomplete', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId }) as ITask;

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);
    }

    await task.markIncomplete();

    res.status(200).json({
      success: true,
      message: 'Task marked as incomplete',
      data: { task }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/stats/overview
// @desc    Get task statistics for dashboard
// @access  Private
router.get('/stats/overview', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksByPriority,
      recentCompleted
    ] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, isCompleted: true }),
      Task.countDocuments({ userId, isCompleted: false, status: { $ne: 'cancelled' } }),
      Task.countDocuments({ 
        userId, 
        isCompleted: false, 
        dueDate: { $lt: new Date() },
        status: { $ne: 'cancelled' }
      }),
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Task.countDocuments({
        userId,
        isCompleted: true,
        completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const priorityStats = {
      low: 0,
      medium: 0,
      high: 0
    };

    tasksByPriority.forEach((item: any) => {
      priorityStats[item._id as keyof typeof priorityStats] = item.count;
    });

    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      tasksByPriority: priorityStats,
      recentActivity: {
        tasksCompletedThisWeek: recentCompleted,
        tasksCreatedThisWeek: 0, // Can be implemented later
        streak: 0 // Can be implemented later
      }
    };

    res.status(200).json({
      success: true,
      data: { stats }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

export default router;