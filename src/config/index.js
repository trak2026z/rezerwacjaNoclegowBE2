/**
 * Configuration module for the application
 * Loads environment variables and provides configuration values
 */
const dotenv = require('dotenv');
const { logger } = require('../utils/logger');

// Constants
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

const DEFAULT_PORT = 5000;
const DEFAULT_MONGO_URI = 'mongodb://localhost:27017/rezerwacje';
const DEFAULT_JWT_SECRET = 'fallback_secret';
const DEFAULT_CORS_ORIGIN = '*';

/**
 * Load environment variables from .env file
 */
function loadEnvironmentVariables() {
  dotenv.config();
}

/**
 * Get current environment
 * @returns {string} Current environment (development, production, test)
 */
function getEnvironment() {
  return process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;
}

/**
 * Create configuration object based on environment variables
 * @param {string} environment - Current environment
 * @returns {Object} Configuration object
 */
function createConfig(environment) {
  const isDevelopment = environment === ENVIRONMENTS.DEVELOPMENT;
  const isProduction = environment === ENVIRONMENTS.PRODUCTION;
  
  return {
    env: environment,
    port: parseInt(process.env.PORT || DEFAULT_PORT, 10),
    
    // JWT secret - fallback only in development
    jwtSecret: process.env.JWT_SECRET || (isDevelopment ? DEFAULT_JWT_SECRET : undefined),
    
    // MongoDB URI - fallback only in development
    mongoUri: process.env.MONGO_URI || (isDevelopment ? DEFAULT_MONGO_URI : undefined),
    
    // CORS origin
    corsOrigin: process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN,
  };
}

/**
 * Validate configuration for production environment
 * @param {Object} config - Configuration object
 * @throws {Error} If required environment variables are missing in production
 */
function validateProductionConfig(config) {
  if (config.env !== ENVIRONMENTS.PRODUCTION) {
    return;
  }
  
  const requiredVars = [
    { key: 'jwtSecret', name: 'JWT_SECRET' },
    { key: 'mongoUri', name: 'MONGO_URI' }
  ];
  
  for (const { key, name } of requiredVars) {
    if (!config[key]) {
      throw new Error(`❌ Missing required environment variable: ${name}`);
    }
  }
}

/**
 * Log configuration in development environment
 * @param {Object} config - Configuration object
 */
function logDevelopmentConfig(config) {
  if (config.env !== ENVIRONMENTS.DEVELOPMENT) {
    return;
  }
  
  // Log non-sensitive configuration values
  logger.info({
    port: config.port,
    mongoUri: config.mongoUri,
    corsOrigin: config.corsOrigin
  }, '✅ Loaded configuration');
}

// Initialize configuration
loadEnvironmentVariables();
const environment = getEnvironment();
const config = createConfig(environment);
validateProductionConfig(config);
logDevelopmentConfig(config);

module.exports = config;
