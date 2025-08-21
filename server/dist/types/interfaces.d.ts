import { Document } from "mongoose";
export interface FirebaseServiceAccount {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}
export interface ApiError extends Error {
    statusCode?: number;
}
export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email: string;
        emailVerified: boolean;
        displayName?: string;
        photoURL?: string;
    };
}
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
}
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
export interface CreateTaskRequest {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    tags?: string[];
}
export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    dueDate?: string;
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
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface ApiError {
    statusCode: number;
    message: string;
    errors?: ValidationError[];
    stack?: string;
}
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
export interface HealthMetric {
    type: 'mood' | 'energy' | 'stress' | 'sleep' | 'exercise';
    value: number;
    note?: string;
    timestamp: Date;
    userId: string;
}
export interface WellnessInsight {
    type: 'recommendation' | 'observation' | 'warning';
    message: string;
    category: 'physical' | 'mental' | 'productivity';
    confidence: number;
    actionable: boolean;
}
//# sourceMappingURL=interfaces.d.ts.map