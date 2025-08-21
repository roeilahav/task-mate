import Task from '../models/Task';
import User from '../models/User';
import { ChatRequest, ChatResponse } from '../types';

export class AIService {

  // Generate AI chat response
  async generateChatResponse(userId: string, message: string, context?: string): Promise<ChatResponse> {
    if (!message || message.trim().length === 0) {
      throw new Error('Message is required');
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
    const aiResponse = this.generateSimpleAIResponse(message, userContext);

    const response: ChatResponse = {
      message: aiResponse.message,
      suggestions: aiResponse.suggestions,
      timestamp: new Date()
    };

    return response;
  }

  // Generate task suggestions
  async generateTaskSuggestions(userId: string) {
    // Get user's task data
    const [pendingTasks, completedTasks, overdueTasks] = await Promise.all([
      Task.findPendingByUserId(userId),
      Task.find({ userId, isCompleted: true }).sort({ completedAt: -1 }).limit(10),
      Task.findOverdueTasks(userId)
    ]);

    // Generate suggestions based on task patterns
    const suggestions = this.generateTaskSuggestionsFromData(pendingTasks, completedTasks, overdueTasks);
    return suggestions;
  }

  // Generate daily plan
  async generateDailyPlan(userId: string) {
    // Get today's tasks and pending tasks
    const [todayTasks, pendingTasks] = await Promise.all([
      Task.findTasksDueToday(userId),
      Task.findPendingByUserId(userId)
    ]);

    // Generate daily plan
    const dailyPlan = this.generateDailyPlanFromTasks(todayTasks, pendingTasks);
    return dailyPlan;
  }

  // Helper: Generate simple AI responses
  private generateSimpleAIResponse(message: string, context: any): { message: string; suggestions: string[] } {
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

  // Helper: Generate task suggestions
  private generateTaskSuggestionsFromData(pendingTasks: any[], completedTasks: any[], overdueTasks: any[]): any[] {
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
    
    if (totalCompleted > 0 && highPriorityCompleted / totalCompleted > 0.7) {
      suggestions.push({
        type: 'productivity',
        title: 'Great Job on High Priority Tasks!',
        description: 'You\'re excellent at completing high-priority tasks. Keep focusing on what matters most.',
        action: 'continue_prioritizing'
      });
    }

    return suggestions;
  }

  // Helper: Generate daily plan
  private generateDailyPlanFromTasks(todayTasks: any[], pendingTasks: any[]) {
    const plan: {
      morning: any[];
      afternoon: any[];
      evening: any[];
      summary: string;
    } = {
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
}