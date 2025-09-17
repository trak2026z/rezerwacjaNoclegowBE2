// src/services/tokenService.js
const jwt = require("jsonwebtoken");
const config = require("../config");
const { UnauthorizedError } = require("../utils/errors");

/**
 * Generate JWT token for a given userId
 */
function generateToken(userId) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "24h" });
}

/**
 * Verify and decode JWT token
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
