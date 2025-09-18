// src/app.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const config = require("./config");
const authentication = require("./routes/authentication");
const rooms = require("./routes/rooms");
const errorHandler = require("./middleware/errorHandler");
const { logger, httpLogger } = require("./utils/logger");

/**
 * Initialize Express application
 * @returns {Object} Express application instance
 */
function createApp() {
  const app = express();
  
  // Configure middleware
  setupMiddleware(app);
  
  // Configure routes
  setupRoutes(app);
  
  // Add error handler (must be last)
  app.use(errorHandler);
  
  return app;
}

/**
 * Configure application middleware
 * @param {Object} app - Express application instance
 */
function setupMiddleware(app) {
  // CORS configuration
  app.use(cors({ origin: config.corsOrigin || "*" }));
  
  // Request parsing
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  
  // Static files
  app.use(express.static(path.join(__dirname, "public")));
  
  // Request logging (includes requestId + userId if available)
  app.use(httpLogger);
}

/**
 * Configure application routes
 * @param {Object} app - Express application instance
 */
function setupRoutes(app) {
  // API routes
  app.use("/authentication", authentication);
  app.use("/rooms", rooms);
  
  // Health check endpoint
  app.get("/health", (req, res) => res.json({ status: "ok" }));
}

/**
 * Connect to MongoDB database
 * @returns {Promise} MongoDB connection promise
 */
async function connectToDatabase() {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info({ uri: config.mongoUri }, "✅ Connected to MongoDB");
  } catch (err) {
    logger.fatal({ err }, "❌ Could NOT connect to MongoDB");
    process.exit(1); // Exit if database connection fails
  }
}

// Initialize database connection
connectToDatabase();

// Create and export Express application
const app = createApp();
module.exports = app;
