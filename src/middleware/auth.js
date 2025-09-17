// src/middleware/auth.js
const { UnauthorizedError } = require("../utils/errors");
const tokenService = require("../services/tokenService");

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return next(new UnauthorizedError("Authorization header missing"));
    }

    // Expect "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return next(new UnauthorizedError("Invalid authorization format"));
    }

    const token = parts[1];

    let decoded;
    try {
      decoded = tokenService.verifyToken(token);
    } catch (err) {
      return next(new UnauthorizedError("Invalid or expired token"));
    }

    req.user = decoded; // np. { userId, iat, exp }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = authMiddleware;
