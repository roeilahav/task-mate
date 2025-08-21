"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const TaskSchema = new mongoose_1.Schema({
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
            validator: function (date) {
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
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});
TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, isCompleted: 1 });
TaskSchema.index({ dueDate: 1, reminderSent: 1 });
TaskSchema.virtual('isOverdue').get(function () {
    if (!this.dueDate || this.isCompleted)
        return false;
    return new Date() > this.dueDate;
});
TaskSchema.methods.markCompleted = function () {
    this.isCompleted = true;
    this.status = 'completed';
    this.completedAt = new Date();
    return this.save();
};
TaskSchema.methods.markIncomplete = function () {
    this.isCompleted = false;
    this.status = 'pending';
    this.completedAt = undefined;
    return this.save();
};
TaskSchema.methods.markReminderSent = function () {
    this.reminderSent = true;
    return this.save();
};
TaskSchema.statics.findByUserId = function (userId) {
    return this.find({ userId }).sort({ createdAt: -1 });
};
TaskSchema.statics.findPendingByUserId = function (userId) {
    return this.find({
        userId,
        isCompleted: false,
        status: { $ne: 'cancelled' }
    }).sort({ dueDate: 1, priority: -1 });
};
TaskSchema.statics.findOverdueTasks = function (userId) {
    const query = {
        dueDate: { $lt: new Date() },
        isCompleted: false,
        status: { $ne: 'cancelled' }
    };
    if (userId) {
        query.userId = userId;
    }
    return this.find(query).sort({ dueDate: 1 });
};
TaskSchema.statics.findTasksDueToday = function (userId) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const query = {
        dueDate: { $gte: startOfDay, $lte: endOfDay },
        isCompleted: false,
        status: { $ne: 'cancelled' }
    };
    if (userId) {
        query.userId = userId;
    }
    return this.find(query).sort({ dueDate: 1 });
};
TaskSchema.pre('save', function (next) {
    if (this.isModified('isCompleted')) {
        if (this.isCompleted && this.status !== 'completed') {
            this.status = 'completed';
            this.completedAt = new Date();
        }
        else if (!this.isCompleted && this.status === 'completed') {
            this.status = 'pending';
            this.completedAt = undefined;
        }
    }
    if (this.tags && this.tags.length > 0) {
        this.tags = [...new Set(this.tags.filter(tag => tag.trim().length > 0))];
    }
    next();
});
exports.default = mongoose_1.default.model('Task', TaskSchema);
//# sourceMappingURL=Task.js.map