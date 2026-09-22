module.exports = function errorHandler(err, req, res, next) {
  // Default status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose: invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Mongoose: duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {});
    message = `Duplicate value for field(s): ${fields.join(", ")}`;
  }

  // Mongoose: validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    message = errors.length ? errors.join(", ") : "Validation error";
  }

  res.status(statusCode).json({
    success: false,
    message,
    // show stack only in development
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};