const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err);

    let statusCode = err.status || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // Handle Mongoose Cast Error (Invalid ID)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ID format for ${err.path}`;
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
