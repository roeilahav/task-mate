import { Response, NextFunction } from 'express';
import { AIService } from '../services/aiService';
import { ApiResponse, AuthenticatedRequest, ChatRequest } from '../types';

const aiService = new AIService();

export class AIController {

  // Chat with AI assistant
  async chat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { message, context }: ChatRequest = req.body;

      const response = await aiService.generateChatResponse(userId, message, context);

      res.status(200).json({
        success: true,
        data: { response }
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error && error.message === 'Message is required') {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        } as ApiResponse);
      }
      next(error);
    }
  }

  // Get AI suggestions for task management
  async getTaskSuggestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;

      const suggestions = await aiService.generateTaskSuggestions(userId);

      res.status(200).json({
        success: true,
        data: { suggestions }
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  // Get AI-generated daily plan
  async getDailyPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;

      const dailyPlan = await aiService.generateDailyPlan(userId);

      res.status(200).json({
        success: true,
        data: { dailyPlan }
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }
}