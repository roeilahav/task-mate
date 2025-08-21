import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

let firebaseApp: admin.app.App;

export const initializeFirebase = (): admin.app.App => {
  try {
    // Check if Firebase is already initialized
    if (firebaseApp) {
      return firebaseApp;
    }

    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    };

    // Validate required environment variables
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
    }

    // Initialize Firebase Admin
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('🔥 Firebase Admin SDK initialized successfully');
    return firebaseApp;

  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    throw new Error(`Firebase initialization failed: ${error}`);
  }
};

// Helper function to get Firebase Auth instance
export const getFirebaseAuth = (): admin.auth.Auth => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return admin.auth(firebaseApp);
};

// Helper function to get Firebase Messaging instance
export const getFirebaseMessaging = (): admin.messaging.Messaging => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return admin.messaging(firebaseApp);
};

// Function to verify Firebase ID token
export const verifyFirebaseToken = async (idToken: string): Promise<admin.auth.DecodedIdToken> => {
  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
};

// Function to send push notification
export const sendPushNotification = async (
  fcmToken: string, 
  title: string, 
  body: string, 
  data?: Record<string, string>
): Promise<string> => {
  try {
    const messaging = getFirebaseMessaging();
    
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        notification: {
          priority: 'high' as const,
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
    };

    const response = await messaging.send(message);
    console.log('✅ Push notification sent successfully:', response);
    return response;
    
  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
    throw new Error(`Push notification failed: ${error}`);
  }
};