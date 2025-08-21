"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const firebase_1 = require("../config/firebase");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                success: false,
                error: 'Authorization header is required'
            });
            return;
        }
        if (!authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Authorization header must start with "Bearer "'
            });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        if (!idToken) {
            res.status(401).json({
                success: false,
                error: 'Token is required'
            });
            return;
        }
        const decodedToken = await (0, firebase_1.verifyFirebaseToken)(idToken);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            emailVerified: decodedToken.email_verified || false,
            displayName: decodedToken.name,
            photoURL: decodedToken.picture,
        };
        console.log('✅ Token verified for user:', req.user.email);
        next();
    }
    catch (error) {
        console.error('❌ Authentication failed:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid or expired authentication token'
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        if (idToken) {
            try {
                const decodedToken = await (0, firebase_1.verifyFirebaseToken)(idToken);
                req.user = {
                    uid: decodedToken.uid,
                    email: decodedToken.email || '',
                    emailVerified: decodedToken.email_verified || false,
                    displayName: decodedToken.name,
                    photoURL: decodedToken.picture,
                };
            }
            catch (error) {
                console.warn('Invalid optional token:', error);
            }
        }
        next();
    }
    catch (error) {
        console.warn('Optional auth error:', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map