module.exports = function errorHandler(err, req, res, next) {
  // Default status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose: invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier format";
  }

  // Mongoose: duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate entry detected";
  }

  // Mongoose: validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error occurred";
  }

  res.status(statusCode).json({
    success: false,
    message,
    // show stack strictly in development mode
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};