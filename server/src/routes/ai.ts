import { Router, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse, AuthenticatedRequest, ChatRequest, ChatResponse } from '../types';
import Task from '../models/Task';
import User from '../models/User';

const router = Router();

// All AI routes require authentication
router.use(authenticateToken);

// @route   POST /api/ai/chat
// @desc    Chat with AI assistant
// @access  Private
router.post('/chat', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { message, context }: ChatRequest = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      } as ApiResponse);
    }

    // Get user context for personalized responses
    const [user, pendingTasks, overdueTasks] = await Promise.all([
      User.findByFirebaseUid(userId),
      Task.findPendingByUserId(userId),
      Task.findOverdueTasks(userId)
    ]);

    // Build context for AI
    const userContext = {
      displayName: user?.displayName || 'User',
      totalPendingTasks: pendingTasks.length,
      overdueTasksCount: overdueTasks.length,
      hasOverdueTasks: overdueTasks.length > 0,
      recentTasks: pendingTasks.slice(0, 3).map(task => ({
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority
      }))
    };

    // For now, we'll create a simple response based on patterns
    // In production, this would call OpenAI API
    const aiResponse = generateSimpleAIResponse(message, userContext);

    const response: ChatResponse = {
      message: aiResponse.message,
      suggestions: aiResponse.suggestions,
      timestamp: new Date()
    };

    res.status(200).json({
      success: true,
      data: { response }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/task-suggestions
// @desc    Get AI suggestions for task management
// @access  Private
router.post('/task-suggestions', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;

    // Get user's task data
    const [pendingTasks, completedTasks, overdueTasks] = await Promise.all([
      Task.findPendingByUserId(userId),
      Task.find({ userId, isCompleted: true }).sort({ completedAt: -1 }).limit(10),
      Task.findOverdueTasks(userId)
    ]);

    // Generate suggestions based on task patterns
    const suggestions = generateTaskSuggestions(pendingTasks, completedTasks, overdueTasks);

    res.status(200).json({
      success: true,
      data: { suggestions }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/daily-plan
// @desc    Get AI-generated daily plan
// @access  Private
router.post('/daily-plan', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;

    // Get today's tasks and pending tasks
    const [todayTasks, pendingTasks] = await Promise.all([
      Task.findTasksDueToday(userId),
      Task.findPendingByUserId(userId)
    ]);

    // Generate daily plan
    const dailyPlan = generateDailyPlan(todayTasks, pendingTasks);

    res.status(200).json({
      success: true,
      data: { dailyPlan }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// Helper function to generate simple AI responses
function generateSimpleAIResponse(message: string, context: any) {
  const lowerMessage = message.toLowerCase();
  
  // Greeting patterns
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      message: `Hello ${context.displayName}! I'm here to help you manage your tasks and stay productive. You currently have ${context.totalPendingTasks} pending tasks. How can I assist you today?`,
      suggestions: [
        "Show me my overdue tasks",
        "What should I focus on today?",
        "Help me prioritize my tasks"
      ]
    };
  }

  // Task-related queries
  if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
    if (context.hasOverdueTasks) {
      return {
        message: `I notice you have ${context.overdueTasksCount} overdue tasks. Would you like me to help you prioritize them? It's important to tackle overdue items first to get back on track.`,
        suggestions: [
          "Show me overdue tasks",
          "Help me reschedule overdue tasks",
          "Create a catch-up plan"
        ]
      };
    }
    
    return {
      message: `You have ${context.totalPendingTasks} pending tasks. Here are your most important upcoming tasks: ${context.recentTasks.map((t: any) => t.title).join(', ')}. Which one would you like to work on first?`,
      suggestions: [
        "Show me today's tasks",
        "Help me prioritize",
        "Create a new task"
      ]
    };
  }

  // Motivation and productivity
  if (lowerMessage.includes('tired') || lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
    return {
      message: "I understand you're feeling overwhelmed. Let's break things down into manageable pieces. Would you like me to suggest a lighter schedule for today or help you identify which tasks are most urgent?",
      suggestions: [
        "Create a lighter schedule",
        "Show priority tasks only",
        "Suggest a break schedule"
      ]
    };
  }

  // Default response
  return {
    message: "I'm here to help you stay organized and productive! You can ask me about your tasks, get suggestions for better time management, or just chat about your goals.",
    suggestions: [
      "What are my priorities today?",
      "Help me organize my tasks",
      "Give me productivity tips"
    ]
  };
}

// Helper function to generate task suggestions
function generateTaskSuggestions(pendingTasks: any[], completedTasks: any[], overdueTasks: any[]) {
  const suggestions = [];

  if (overdueTasks.length > 0) {
    suggestions.push({
      type: 'urgent',
      title: 'Address Overdue Tasks',
      description: `You have ${overdueTasks.length} overdue tasks. Consider rescheduling or breaking them into smaller pieces.`,
      action: 'prioritize_overdue'
    });
  }

  if (pendingTasks.length > 10) {
    suggestions.push({
      type: 'organization',
      title: 'Task Cleanup',
      description: 'You have many pending tasks. Consider archiving completed ones and prioritizing the rest.',
      action: 'organize_tasks'
    });
  }

  // Analyze patterns from completed tasks
  const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length;
  const totalCompleted = completedTasks.length;
  
  if (highPriorityCompleted / totalCompleted > 0.7) {
    suggestions.push({
      type: 'productivity',
      title: 'Great Job on High Priority Tasks!',
      description: 'You\'re excellent at completing high-priority tasks. Keep focusing on what matters most.',
      action: 'continue_prioritizing'
    });
  }

  return suggestions;
}

// Helper function to generate daily plan
function generateDailyPlan(todayTasks: any[], pendingTasks: any[]) {
  const plan = {
    morning: [1],
    afternoon: [1],
    evening: [1],
    summary: ''
  };

  // Sort tasks by priority
  const highPriorityTasks = todayTasks.filter(t => t.priority === 'high');
  const mediumPriorityTasks = todayTasks.filter(t => t.priority === 'medium');
  const lowPriorityTasks = todayTasks.filter(t => t.priority === 'low');

  // Assign to time slots without duplicating tasks
  plan.morning = highPriorityTasks.slice(0, 2);
  plan.afternoon = highPriorityTasks.slice(2, 4).concat(mediumPriorityTasks.slice(0, 2));
  plan.evening = mediumPriorityTasks.slice(2, 4).concat(lowPriorityTasks.slice(0, 2));

  plan.summary = `Today you have ${todayTasks.length} tasks scheduled. Focus on ${highPriorityTasks.length} high-priority items first, then tackle the medium-priority tasks.`;

  return plan;
}

export default router;