const jwt = require('jsonwebtoken');
const config = require('../config'); // ✅ zamiast '../config/database'

module.exports = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => { // ✅
    if (err) {
      return res.status(401).json({ success: false, message: 'Token invalid', error: err.message });
    }
    req.decoded = decoded;
    next();
  });
};
