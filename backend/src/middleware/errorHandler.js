const errorHandler = (err, req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(`[ERROR] ${req.method} ${req.url}:`, err);
    } else {
        console.error(`[ERROR] ${req.method} ${req.url}: ${err.message}`);
    }

    let statusCode = err.status || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error occurred';
    }

    // Handle Mongoose Cast Error (Invalid ID)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid resource identifier format';
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
