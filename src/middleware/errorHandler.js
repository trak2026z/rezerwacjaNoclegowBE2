/**
 * Middleware obsługi błędów
 * Przechwytuje i przetwarza błędy aplikacji, zwracając odpowiednie odpowiedzi HTTP
 */
const { AppError, UnauthorizedError } = require("../utils/errors");
const { logger } = require("../utils/logger");

/**
 * Stałe dla typów błędów i komunikatów
 */
const ERROR_TYPES = {
  VALIDATION_ERROR: "ValidationError",
  CAST_ERROR: "CastError"
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized",
  INVALID_ID: "Invalid ID format.",
  INTERNAL_SERVER: "Internal Server Error"
};

/**
 * Loguje szczegóły błędu
 * 
 * @param {Error} err - Obiekt błędu
 * @param {Object} req - Obiekt żądania Express
 */
function logError(err, req) {
  const statusCode = err.statusCode || 500;
  
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
}

/**
 * Middleware obsługi błędów
 * 
 * @param {Error} err - Obiekt błędu
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 * @param {Function} next - Funkcja przekazująca sterowanie do następnego middleware
 * @returns {Object} Odpowiedź HTTP z informacją o błędzie
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Logowanie błędu
  logError(err, req);

  // Jeśli odpowiedź już została wysłana
  if (res.headersSent) {
    return next(err);
  }

  // 🔹 Najpierw JWT Unauthorized (ważne: przed AppError!)
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      success: false,
      message: err.message || ERROR_MESSAGES.UNAUTHORIZED,
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
  if (err.name === ERROR_TYPES.VALIDATION_ERROR) {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  // 🔹 CastError (np. nieprawidłowy ObjectId)
  if (err.name === ERROR_TYPES.CAST_ERROR) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_ID,
    });
  }

  // 🔹 Fallback – Internal Server Error
  return res.status(500).json({
    success: false,
    message: ERROR_MESSAGES.INTERNAL_SERVER,
  });
}

module.exports = errorHandler;
