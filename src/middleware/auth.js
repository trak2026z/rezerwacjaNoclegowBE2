// src/middleware/auth.js
const jwt = require("jsonwebtoken");
const config = require("../config");
const { UnauthorizedError } = require("../utils/errors");

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

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // zamiast req.decoded
    next();
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

module.exports = authMiddleware;
