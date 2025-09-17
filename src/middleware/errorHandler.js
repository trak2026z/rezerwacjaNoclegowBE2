// src/middleware/errorHandler.js
const { AppError } = require("../utils/errors");

function errorHandler(err, req, res, next) {
  // Logowanie do serwera (konsola / monitoring)
  console.error(`❌ Error [${err.name}]`, {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    path: req.originalUrl,
    method: req.method,
  });

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
