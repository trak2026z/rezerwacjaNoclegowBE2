const dotenv = require('dotenv');

// Load .env file
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret', // ⚠️ fallback tylko w dev
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/rezerwacje',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

// 🔒 W produkcji wymagaj podania JWT_SECRET i MONGO_URI
if (config.env === 'production') {
  if (!process.env.JWT_SECRET) {
    throw new Error('❌ Missing required environment variable: JWT_SECRET');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('❌ Missing required environment variable: MONGO_URI');
  }
}

// 🐛 Loguj konfigurację tylko w trybie development
if (config.env === 'development') {
  console.log('✅ Loaded configuration:', {
    port: config.port,
    mongoUri: config.mongoUri,
    corsOrigin: config.corsOrigin
  });
}

module.exports = config;
