const jwt = require('jsonwebtoken');
const config = require('../config/database');

module.exports = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.json({ success: false, user: null, message: 'No token provided' });
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.json({ success: false, user: null, message: 'Token invalid: ' + err });
    }
    req.decoded = decoded;
    next();
  });
};
