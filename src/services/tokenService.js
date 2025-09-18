/**
 * Serwis obsługujący operacje związane z tokenami JWT
 * @module services/tokenService
 */
// src/services/tokenService.js
const jwt = require("jsonwebtoken");
const config = require("../config");
const { UnauthorizedError } = require("../utils/errors");

/**
 * Generuje token JWT dla podanego identyfikatora użytkownika
 * @param {string} userId - Identyfikator użytkownika
 * @returns {string} - Wygenerowany token JWT
 */
function generateToken(userId) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "24h" });
}

/**
 * Weryfikuje i dekoduje token JWT
 * @param {string} token - Token JWT do weryfikacji
 * @returns {Object} - Zdekodowane dane z tokenu
 * @throws {UnauthorizedError} - Gdy token jest nieprawidłowy lub wygasł
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired token.");
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
