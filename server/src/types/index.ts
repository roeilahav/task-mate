import mongoose, { Document } from 'mongoose';
import { Request } from 'express';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Extended Request interface for authentication
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    emailVerified: boolean;
    displayName?: string;
    photoURL?: string;
  };
}

// Database Model Interfaces
export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  fcmToken?: string;
  isActive: boolean;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Instance methods
  updateLastLogin(): Promise<IUser>;
  updateFCMToken(token: string): Promise<IUser>;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  userId: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: string;
  tags: string[];
  isCompleted: boolean;
  completedAt?: Date;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  markCompleted(): Promise<ITask>;
  markIncomplete(): Promise<ITask>;
  markReminderSent(): Promise<ITask>;
  
  // Virtual properties
  readonly isOverdue: boolean;
}

// Task related request types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string; // ISO date string
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category?: string;
  tags?: string[];
  isCompleted?: boolean;
}

export interface TaskQuery {
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string;
  dueBefore?: string;
  dueAfter?: string;
  isCompleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// User related request types
export interface UpdateUserRequest {
  displayName?: string;
  photoURL?: string;
  fcmToken?: string;
  preferences?: {
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
  };
}

export interface UserProfile {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isActive: boolean;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// AI Chat types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  timestamp: Date;
}

// Push notification types
export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  fcmToken: string;
}

export interface TaskReminderNotification {
  taskId: string;
  title: string;
  dueDate: Date;
  userId: string;
}

// Dashboard/Statistics types
export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  tasksByCategory: Record<string, number>;
  recentActivity: {
    tasksCompletedThisWeek: number;
    tasksCreatedThisWeek: number;
    streak: number;
  };
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiError extends Error {
  statusCode?: number;
  errors?: ValidationError[];
}

// Firebase types
export interface DecodedFirebaseToken {
  uid: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  firebase: {
    identities: Record<string, any>;
    sign_in_provider: string;
  };
}

// Health/Wellness types (for future features)
export interface HealthMetric {
  type: 'mood' | 'energy' | 'stress' | 'sleep' | 'exercise';
  value: number; // 1-10 scale
  note?: string;
  timestamp: Date;
  userId: string;
}

export interface WellnessInsight {
  type: 'recommendation' | 'observation' | 'warning';
  message: string;
  category: 'physical' | 'mental' | 'productivity';
  confidence: number; // 0-1
  actionable: boolean;
}

// Interface for Task document
export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  userId: string; // Firebase UID
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: string;
  tags: string[];
  isCompleted: boolean;
  completedAt?: Date;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Static methods interface
export interface ITaskModel extends mongoose.Model<ITask> {
  findByUserId(userId: string): Promise<ITask[]>;
  findPendingByUserId(userId: string): Promise<ITask[]>;
  findOverdueTasks(userId?: string): Promise<ITask[]>;
  findTasksDueToday(userId?: string): Promise<ITask[]>;
}

// Static methods interface
export interface IUserModel extends mongoose.Model<IUser> {
  findByFirebaseUid(uid: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
}