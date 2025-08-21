import { Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../config/firebase';
import { AuthenticatedRequest } from '../types';

// Middleware to verify Firebase authentication token
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.get('Authorization');
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Authorization header is required'
      });
      return;
    }

    // Check if header starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authorization header must start with "Bearer "'
      });
      return;
    }

    // Extract token
    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      res.status(401).json({
        success: false,
        error: 'Token is required'
      });
      return;
    }

    // Verify token with Firebase
    const decodedToken = await verifyFirebaseToken(idToken);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      emailVerified: decodedToken.email_verified || false,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
    };

    console.log('✅ Token verified for user:', req.user.email);
    next();

  } catch (error) {
    console.error('❌ Authentication failed:', error);
    
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token'
    });
  }
};

// Optional middleware - authenticate if token exists, but don't require it
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (idToken) {
      try {
        const decodedToken = await verifyFirebaseToken(idToken);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          emailVerified: decodedToken.email_verified || false,
          displayName: decodedToken.name,
          photoURL: decodedToken.picture,
        };
      } catch (error) {
        // Invalid token, but we don't fail - just continue without auth
        console.warn('Invalid optional token:', error);
      }
    }
    
    next();
  } catch (error) {
    // Any error in optional auth should not block the request
    console.warn('Optional auth error:', error);
    next();
  }
};