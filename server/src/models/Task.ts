import mongoose, { Document, Schema } from 'mongoose';
import { ITask, ITaskModel } from '../types';



// Task Schema
const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    minlength: [1, 'Title cannot be empty']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(date: Date) {
        // Allow past dates but warn - sometimes people add overdue tasks
        return date instanceof Date && !isNaN(date.getTime());
      },
      message: 'Please provide a valid date'
    }
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be: low, medium, or high'
    },
    default: 'medium'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'completed', 'cancelled'],
      message: 'Status must be: pending, in-progress, completed, or cancelled'
    },
    default: 'pending'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for better query performance
TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, isCompleted: 1 });
TaskSchema.index({ dueDate: 1, reminderSent: 1 }); // For reminder system

// Virtual for checking if task is overdue
TaskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.isCompleted) return false;
  return new Date() > this.dueDate;
});

// Instance methods
TaskSchema.methods.markCompleted = function() {
  this.isCompleted = true;
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

TaskSchema.methods.markIncomplete = function() {
  this.isCompleted = false;
  this.status = 'pending';
  this.completedAt = undefined;
  return this.save();
};

TaskSchema.methods.markReminderSent = function() {
  this.reminderSent = true;
  return this.save();
};

// Static methods
TaskSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

TaskSchema.statics.findPendingByUserId = function(userId: string) {
  return this.find({ 
    userId, 
    isCompleted: false,
    status: { $ne: 'cancelled' }
  }).sort({ dueDate: 1, priority: -1 });
};

TaskSchema.statics.findOverdueTasks = function(userId?: string) {
  const query: any = {
    dueDate: { $lt: new Date() },
    isCompleted: false,
    status: { $ne: 'cancelled' }
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query).sort({ dueDate: 1 });
};

TaskSchema.statics.findTasksDueToday = function(userId?: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  const query: any = {
    dueDate: { $gte: startOfDay, $lte: endOfDay },
    isCompleted: false,
    status: { $ne: 'cancelled' }
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query).sort({ dueDate: 1 });
};

// Pre-save middleware
TaskSchema.pre('save', function(next) {
  // Auto-update completion status based on isCompleted
  if (this.isModified('isCompleted')) {
    if (this.isCompleted && this.status !== 'completed') {
      this.status = 'completed';
      this.completedAt = new Date();
    } else if (!this.isCompleted && this.status === 'completed') {
      this.status = 'pending';
      this.completedAt = undefined;
    }
  }
  
  // Clean up tags - remove empty strings and duplicates
  if (this.tags && Array.isArray(this.tags) && this.tags.length > 0) {
    this.tags = [...new Set(this.tags.filter((tag: string) => tag.trim().length > 0))];
  }
  
  next();
});

export default mongoose.model<ITask, ITaskModel>('Task', TaskSchema);