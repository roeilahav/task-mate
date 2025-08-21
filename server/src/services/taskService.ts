import Task from '../models/Task';
import { CreateTaskRequest, UpdateTaskRequest, TaskQuery, PaginationInfo } from '../types';

export class TaskService {

  // Get all tasks with filtering and pagination
  async getTasks(userId: string, query: TaskQuery) {
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

    return { tasks, pagination };
  }

  // Create new task
  async createTask(userId: string, taskData: CreateTaskRequest) {
    // Validate required fields
    if (!taskData.title || taskData.title.trim().length === 0) {
      throw new Error('Task title is required');
    }

    // Create task
    const task = new Task({
      ...taskData,
      userId,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined
    });

    await task.save();
    return task;
  }

  // Get single task by ID
  async getTaskById(userId: string, taskId: string) {
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  // Update task by ID
  async updateTask(userId: string, taskId: string, updateData: UpdateTaskRequest) {
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      throw new Error('Task not found');
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
    return task;
  }

  // Delete task by ID
  async deleteTask(userId: string, taskId: string) {
    const task = await Task.findOneAndDelete({ _id: taskId, userId });

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  // Mark task as completed
  async markTaskCompleted(userId: string, taskId: string) {
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      throw new Error('Task not found');
    }

    await (task as any).markCompleted();
    return task;
  }

  // Mark task as incomplete
  async markTaskIncomplete(userId: string, taskId: string) {
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      throw new Error('Task not found');
    }

    await (task as any).markIncomplete();
    return task;
  }

  // Get task statistics
  async getTaskStatistics(userId: string) {
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

    return stats;
  }
}