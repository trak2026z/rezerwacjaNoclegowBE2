const jwt = require('jsonwebtoken');
const config = require('../config');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: 'Authorization header missing' });
  }

  // Expect "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid authorization format' });
  }
  const token = parts[1];

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      // nie zwracamy szczegółów błędu atakującemu
      return res
        .status(403)
        .json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = decoded; // zamiast req.decoded
    return next();
  });
}

module.exports = authMiddleware;
