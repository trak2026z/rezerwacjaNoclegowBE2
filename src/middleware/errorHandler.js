// src/middleware/errorHandler.js
const { AppError, UnauthorizedError } = require("../utils/errors");
const { logger } = require("../utils/logger");

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Logowanie błędu
  logger.error(
    {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.originalUrl,
      method: req.method,
      userId: req.user?.userId,
      requestId: req.id,
    },
    `❌ Error [${err.name}]`
  );

  // Jeśli odpowiedź już poszła
  if (res.headersSent) {
    return next(err);
  }

  // 🔹 Najpierw JWT Unauthorized (ważne: przed AppError!)
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      success: false,
      message: err.message || "Unauthorized",
    });
  }

  // 🔹 Obsługa własnych AppError
  if (err instanceof AppError) {
    return res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // 🔹 Mongoose ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  // 🔹 CastError (np. nieprawidłowy ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format.",
    });
  }

  // 🔹 Fallback – Internal Server Error
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}

module.exports = errorHandler;
