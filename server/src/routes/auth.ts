import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import { ApiResponse, AuthenticatedRequest, UpdateUserRequest } from '../types';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register/Login user with Firebase (create user in our DB)
// @access  Private (requires Firebase token)
router.post('/register', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { displayName, fcmToken } = req.body;
    const firebaseUser = req.user!;

    // Check if user already exists
    let user = await User.findByFirebaseUid(firebaseUser.uid);

    if (user) {
      // Update last login
      await user.updateLastLogin();
      
      return res.status(200).json({
        success: true,
        message: 'User already exists',
        data: { user }
      } as ApiResponse);
    }

    // Create new user
    user = new User({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: displayName || firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      fcmToken: fcmToken,
      lastLoginAt: new Date()
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const firebaseUser = req.user!;
    
    const user = await User.findByFirebaseUid(firebaseUser.uid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    // Update last login
    await user.updateLastLogin();

    res.status(200).json({
      success: true,
      data: { user }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const firebaseUser = req.user!;
    const updateData: UpdateUserRequest = req.body;

    const user = await User.findByFirebaseUid(firebaseUser.uid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    // Update allowed fields
    if (updateData.displayName !== undefined) user.displayName = updateData.displayName;
    if (updateData.photoURL !== undefined) user.photoURL = updateData.photoURL;
    if (updateData.fcmToken !== undefined) user.fcmToken = updateData.fcmToken;
    
    // Update preferences
    if (updateData.preferences) {
      if (updateData.preferences.notifications !== undefined) {
        user.preferences.notifications = updateData.preferences.notifications;
      }
      if (updateData.preferences.theme !== undefined) {
        user.preferences.theme = updateData.preferences.theme;
      }
      if (updateData.preferences.language !== undefined) {
        user.preferences.language = updateData.preferences.language;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/fcm-token
// @desc    Update FCM token for push notifications
// @access  Private
router.post('/fcm-token', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { fcmToken } = req.body;
    const firebaseUser = req.user!;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        error: 'FCM token is required'
      } as ApiResponse);
    }

    const user = await User.findByFirebaseUid(firebaseUser.uid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    await user.updateFCMToken(fcmToken);

    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully'
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/auth/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const firebaseUser = req.user!;
    
    const user = await User.findByFirebaseUid(firebaseUser.uid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    // Deactivate instead of delete (soft delete)
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    } as ApiResponse);

  } catch (error) {
    next(error);
  }
});

export default router;