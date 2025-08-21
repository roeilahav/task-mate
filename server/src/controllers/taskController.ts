import { Response, NextFunction } from 'express';
import { ApiResponse, CreateTaskRequest, UpdateTaskRequest, TaskQuery, AuthenticatedRequest } from '../types';
import { TaskService } from '../services/taskService';

const taskService = new TaskService();

export class TaskController {

  // Get all tasks for current user with filtering and pagination
  async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const query: TaskQuery = req.query;

      const result = await taskService.getTasks(userId, query);

      res.status(200).json({
        success: true,
        data: { tasks: result.tasks },
        pagination: result.pagination
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  // Create a new task
  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const taskData: CreateTaskRequest = req.body;

      const task = await taskService.createTask(userId, taskData);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { task }
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error && error.message === 'Task title is required') {
        return res.status(400).json({
          success: false,
          error: 'Task title is required'
        } as ApiResponse);
      }
      next(error);
    }
  }

  // Get single task by ID
  async getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const task = await taskService.getTaskById(userId, id);

      res.status(200).json({
        success: true,
        data: { task }
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        } as ApiResponse);
      }
      next(error);
    }
  }

  // Update task by ID
  async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;
      const updateData: UpdateTaskRequest = req.body;

      const task = await taskService.updateTask(userId, id, updateData);

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: { task }
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        } as ApiResponse);
      }
      next(error);
    }
  }

  // Delete task by ID
  async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      await taskService.deleteTask(userId, id);

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        } as ApiResponse);
      }
      next(error);
    }
  }

  // Mark task as completed
  async markTaskCompleted(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const task = await taskService.markTaskCompleted(userId, id);

      res.status(200).json({
        success: true,
        message: 'Task marked as completed',
        data: { task }
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        } as ApiResponse);
      }
      next(error);
    }
  }

  // Mark task as incomplete
  async markTaskIncomplete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const task = await taskService.markTaskIncomplete(userId, id);

      res.status(200).json({
        success: true,
        message: 'Task marked as incomplete',
        data: { task }
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        } as ApiResponse);
      }
      next(error);
    }
  }

  // Get task statistics for dashboard
  async getTaskStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;

      const stats = await taskService.getTaskStatistics(userId);

      res.status(200).json({
        success: true,
        data: { stats }
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }
}