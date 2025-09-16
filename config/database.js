const crypto = require('crypto').randomBytes(256).toString('hex');

module.exports = {
  uri: process.env.MONGO_URL || 'mongodb://db:27017/rezerwacja', // DEV: kontener docker
  secret: crypto,
  db: 'rezerwacja'
};
