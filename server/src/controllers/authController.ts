import { Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse, AuthenticatedRequest, UpdateUserRequest } from '../types';

const authService = new AuthService();

export class AuthController {

  // Register/Login user with Firebase
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { displayName, fcmToken } = req.body;
      const firebaseUser = req.user!;

      const result = await authService.registerUser(firebaseUser, displayName, fcmToken);

      const statusCode = result.isNewUser ? 201 : 200;
      const message = result.isNewUser ? 'User registered successfully' : 'User already exists';

      res.status(statusCode).json({
        success: true,
        message,
        data: { user: result.user }
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const firebaseUser = req.user!;
      
      const user = await authService.getUserProfile(firebaseUser.uid);

      res.status(200).json({
        success: true,
        data: { user }
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        } as ApiResponse);
      }
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const firebaseUser = req.user!;
      const updateData: UpdateUserRequest = req.body;

      const user = await authService.updateUserProfile(firebaseUser.uid, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        } as ApiResponse);
      }
      next(error);
    }
  }

  // Update FCM token for push notifications
  async updateFCMToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { fcmToken } = req.body;
      const firebaseUser = req.user!;

      if (!fcmToken) {
        return res.status(400).json({
          success: false,
          error: 'FCM token is required'
        } as ApiResponse);
      }

      await authService.updateFCMToken(firebaseUser.uid, fcmToken);

      res.status(200).json({
        success: true,
        message: 'FCM token updated successfully'
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        } as ApiResponse);
      }
      next(error);
    }
  }

  // Deactivate user account
  async deactivateAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const firebaseUser = req.user!;
      
      await authService.deactivateAccount(firebaseUser.uid);

      res.status(200).json({
        success: true,
        message: 'Account deactivated successfully'
      } as ApiResponse);

    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        } as ApiResponse);
      }
      next(error);
    }
  }
}