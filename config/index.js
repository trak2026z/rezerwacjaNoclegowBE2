const dotenv = require('dotenv');

// Load .env file
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret', // fallback tylko do dev
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/rezerwacje',
  corsOrigin: process.env.CORS_ORIGIN || '*' // dodane
};

module.exports = config;
