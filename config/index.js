const dotenv = require('dotenv');

// Load .env file into process.env
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,

  // ⚠️ Fallback JWT_SECRET tylko w development
  jwtSecret:
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'fallback_secret' : undefined),

  // ⚠️ Fallback tylko lokalnie
  mongoUri:
    process.env.MONGO_URI ||
    (process.env.NODE_ENV !== 'production'
      ? 'mongodb://localhost:27017/rezerwacje'
      : undefined),

  corsOrigin: process.env.CORS_ORIGIN || '*',
};

// 🔒 W produkcji wymagamy podania JWT_SECRET i MONGO_URI
if (config.env === 'production') {
  if (!config.jwtSecret) {
    throw new Error('❌ Missing required environment variable: JWT_SECRET');
  }
  if (!config.mongoUri) {
    throw new Error('❌ Missing required environment variable: MONGO_URI');
  }
}

// 🐛 Loguj konfigurację tylko w trybie development (bez sekretnych wartości!)
if (config.env === 'development') {
  console.log('✅ Loaded configuration:', {
    port: config.port,
    mongoUri: config.mongoUri,
    corsOrigin: config.corsOrigin,
  });
}

module.exports = config;
