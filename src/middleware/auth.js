// src/middleware/auth.js
const { UnauthorizedError } = require("../utils/errors");
const tokenService = require("../services/tokenService");

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    throw new UnauthorizedError("Authorization header missing");
  }

  // Expect "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new UnauthorizedError("Invalid authorization format");
  }

  const token = parts[1];
  const decoded = tokenService.verifyToken(token);

  req.user = decoded; // np. { userId, iat, exp }
  next();
}

module.exports = authMiddleware;
