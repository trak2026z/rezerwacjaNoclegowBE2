/**
 * Moduł zawierający klasy błędów używane w aplikacji
 * @module utils/errors
 */
// src/utils/errors.js

/**
 * Bazowa klasa błędu aplikacji
 * @class AppError
 * @extends Error
 */
class AppError extends Error {
  /**
   * Tworzy instancję AppError
   * @param {string} message - Komunikat błędu
   * @param {number} statusCode - Kod statusu HTTP
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Błąd nieprawidłowego żądania (400 Bad Request)
 * @class BadRequestError
 * @extends AppError
 */
class BadRequestError extends AppError {
  /**
   * Tworzy instancję BadRequestError
   * @param {string} [message="Bad Request"] - Komunikat błędu
   */
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

/**
 * Błąd braku autoryzacji (401 Unauthorized)
 * @class UnauthorizedError
 * @extends AppError
 */
class UnauthorizedError extends AppError {
  /**
   * Tworzy instancję UnauthorizedError
   * @param {string} [message="Unauthorized"] - Komunikat błędu
   */
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * Błąd braku dostępu (403 Forbidden)
 * @class ForbiddenError
 * @extends AppError
 */
class ForbiddenError extends AppError {
  /**
   * Tworzy instancję ForbiddenError
   * @param {string} [message="Forbidden"] - Komunikat błędu
   */
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/**
 * Błąd nieznalezionego zasobu (404 Not Found)
 * @class NotFoundError
 * @extends AppError
 */
class NotFoundError extends AppError {
  /**
   * Tworzy instancję NotFoundError
   * @param {string} [message="Not Found"] - Komunikat błędu
   */
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

/**
 * Błąd konfliktu (409 Conflict)
 * @class ConflictError
 * @extends AppError
 */
class ConflictError extends AppError {
  /**
   * Tworzy instancję ConflictError
   * @param {string} [message="Conflict"] - Komunikat błędu
   */
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
