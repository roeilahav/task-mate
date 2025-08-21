import admin from 'firebase-admin';
export declare const initializeFirebase: () => admin.app.App;
export declare const getFirebaseAuth: () => admin.auth.Auth;
export declare const getFirebaseMessaging: () => admin.messaging.Messaging;
export declare const verifyFirebaseToken: (idToken: string) => Promise<admin.auth.DecodedIdToken>;
export declare const sendPushNotification: (fcmToken: string, title: string, body: string, data?: Record<string, string>) => Promise<string>;
//# sourceMappingURL=firebase.d.ts.map