import User from '../models/User';
import { UpdateUserRequest } from '../types';

export class AuthService {
  
  // Register or login user
  async registerUser(firebaseUser: any, displayName?: string, fcmToken?: string) {
    // Check if user already exists
    let user = await User.findByFirebaseUid(firebaseUser.uid);

    if (user) {
      // Update last login
      await user.updateLastLogin();
      return { user, isNewUser: false };
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
    return { user, isNewUser: true };
  }

  // Get user profile
  async getUserProfile(firebaseUid: string) {
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Update last login
    await user.updateLastLogin();
    return user;
  }

  // Update user profile
  async updateUserProfile(firebaseUid: string, updateData: UpdateUserRequest) {
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      throw new Error('User not found');
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
    return user;
  }

  // Update FCM token
  async updateFCMToken(firebaseUid: string, fcmToken: string) {
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      throw new Error('User not found');
    }

    await user.updateFCMToken(fcmToken);
    return user;
  }

  // Deactivate account
  async deactivateAccount(firebaseUid: string) {
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Deactivate instead of delete (soft delete)
    user.isActive = false;
    await user.save();
    return user;
  }
}