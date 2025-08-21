"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = exports.verifyFirebaseToken = exports.getFirebaseMessaging = exports.getFirebaseAuth = exports.initializeFirebase = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
let firebaseApp;
const initializeFirebase = () => {
    try {
        if (firebaseApp) {
            return firebaseApp;
        }
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
            token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
        };
        const requiredEnvVars = [
            'FIREBASE_PROJECT_ID',
            'FIREBASE_PRIVATE_KEY_ID',
            'FIREBASE_PRIVATE_KEY',
            'FIREBASE_CLIENT_EMAIL',
            'FIREBASE_CLIENT_ID'
        ];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
        }
        firebaseApp = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
        console.log('🔥 Firebase Admin SDK initialized successfully');
        return firebaseApp;
    }
    catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
        throw new Error(`Firebase initialization failed: ${error}`);
    }
};
exports.initializeFirebase = initializeFirebase;
const getFirebaseAuth = () => {
    if (!firebaseApp) {
        throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return firebase_admin_1.default.auth(firebaseApp);
};
exports.getFirebaseAuth = getFirebaseAuth;
const getFirebaseMessaging = () => {
    if (!firebaseApp) {
        throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return firebase_admin_1.default.messaging(firebaseApp);
};
exports.getFirebaseMessaging = getFirebaseMessaging;
const verifyFirebaseToken = async (idToken) => {
    try {
        const auth = (0, exports.getFirebaseAuth)();
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken;
    }
    catch (error) {
        console.error('Token verification failed:', error);
        throw new Error('Invalid or expired token');
    }
};
exports.verifyFirebaseToken = verifyFirebaseToken;
const sendPushNotification = async (fcmToken, title, body, data) => {
    try {
        const messaging = (0, exports.getFirebaseMessaging)();
        const message = {
            token: fcmToken,
            notification: {
                title,
                body,
            },
            data: data || {},
            android: {
                notification: {
                    priority: 'high',
                    defaultSound: true,
                    defaultVibrateTimings: true,
                },
            },
        };
        const response = await messaging.send(message);
        console.log('✅ Push notification sent successfully:', response);
        return response;
    }
    catch (error) {
        console.error('❌ Failed to send push notification:', error);
        throw new Error(`Push notification failed: ${error}`);
    }
};
exports.sendPushNotification = sendPushNotification;
//# sourceMappingURL=firebase.js.map