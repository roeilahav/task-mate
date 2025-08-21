import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

// @route   POST /api/auth/register
// @desc    Register/Login user with Firebase (create user in our DB)
// @access  Private (requires Firebase token)
router.post('/register', authenticateToken, authController.register.bind(authController));

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController));

// @route   POST /api/auth/fcm-token
// @desc    Update FCM token for push notifications
// @access  Private
router.post('/fcm-token', authenticateToken, authController.updateFCMToken.bind(authController));

// @route   DELETE /api/auth/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', authenticateToken, authController.deactivateAccount.bind(authController));

export default router;