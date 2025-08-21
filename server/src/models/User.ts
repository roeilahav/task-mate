import mongoose, { Document, Schema } from 'mongoose';
import { IUser, IUserModel } from '../types';


// User Schema
const UserSchema: Schema = new Schema({
  firebaseUid: {
    type: String,
    required: [true, 'Firebase UID is required'],
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters']
  },
  photoURL: {
    type: String,
    trim: true,
  },
  fcmToken: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    language: {
      type: String,
      default: 'en',
      maxlength: [5, 'Language code cannot exceed 5 characters']
    }
  },
  lastLoginAt: {
    type: Date,
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive fields when converting to JSON
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for better query performance
// UserSchema.index({ email: 1 });
// UserSchema.index({ firebaseUid: 1 });
// UserSchema.index({ createdAt: -1 });

// Instance methods
UserSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

UserSchema.methods.updateFCMToken = function(token: string) {
  this.fcmToken = token;
  return this.save();
};

// Static methods
UserSchema.statics.findByFirebaseUid = function(uid: string) {
  return this.findOne({ firebaseUid: uid });
};

UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Pre-save middleware
UserSchema.pre('save', function(next) {
  // Ensure email is lowercase
  if (this.email && typeof this.email === 'string') {
    this.email = this.email.toLowerCase();
  }
  next();
});

export default mongoose.model<IUser, IUserModel>('User', UserSchema);