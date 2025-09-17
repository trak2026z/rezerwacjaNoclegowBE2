// src/middleware/errorHandler.js
const { AppError, UnauthorizedError } = require("../utils/errors");
const { logger } = require("../utils/logger");

function errorHandler(err, req, res, next) {
  // Logowanie do centralnego loggera
  logger.error(
    {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500,
      path: req.originalUrl,
      method: req.method,
      userId: req.user?.userId,
      requestId: req.id,
    },
    `❌ Error [${err.name}]`
  );

  // Jeśli odpowiedź już została wysłana, przekaż dalej
  if (res.headersSent) {
    return next(err);
  }

  // Obsługa błędów aplikacyjnych (AppError i pochodne)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Obsługa błędów autoryzacji JWT
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      success: false,
      message: err.message || "Unauthorized",
    });
  }

  // Obsługa błędów walidacji Mongoose
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  // Obsługa CastError (np. nieprawidłowe ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format.",
    });
  }

  // Fallback – Internal Server Error
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}

module.exports = errorHandler;
