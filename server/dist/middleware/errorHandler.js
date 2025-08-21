"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.error('Error Handler:', {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
        url: req.url,
        method: req.method,
    });
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error.statusCode = 404;
        error.message = message;
    }
    if (err.name === 'MongoServerError' && err.code === 11000) {
        const message = 'Duplicate field value entered';
        error.statusCode = 400;
        error.message = message;
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        error.statusCode = 400;
        error.message = message.join(', ');
    }
    if (err.message?.includes('Firebase')) {
        error.statusCode = 401;
        error.message = 'Authentication failed';
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map