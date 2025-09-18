// src/server.js
require("module-alias/register");
const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config");
const { logger } = require("./utils/logger");

// Configuration
const SHUTDOWN_TIMEOUT = 10000; // 10 seconds
let isShuttingDown = false;
let server;

/**
 * Starts the HTTP server
 */
function startServer() {
  server = app.listen(config.port, () => {
    logger.info(
      { env: config.env, port: config.port },
      `🚀 Server running in ${config.env || "development"} mode on port ${config.port}`
    );
  });

  // Handle server errors (e.g., port already in use)
  server.on("error", (err) => {
    logger.error({ err }, "❌ Server error");
    process.exit(1);
  });
}

/**
 * Gracefully shuts down the server and database connections
 * @param {string} signal - The signal that triggered the shutdown
 */
function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn({ signal }, `📴 Received ${signal}. Closing server...`);

  server.close(() => {
    logger.info("✅ HTTP server closed.");
    
    closeDatabase();
  });

  // Force exit if shutdown hangs
  setTimeout(() => {
    logger.fatal("⚠️ Forced shutdown after timeout");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT).unref();
}

/**
 * Closes the database connection
 */
function closeDatabase() {
  mongoose.connection.close(false, () => {
    logger.info("✅ MongoDB connection closed.");
    process.exit(0);
  });
}

/**
 * Sets up process event handlers
 */
function setupProcessHandlers() {
  // System signals
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  
  // Uncaught exceptions
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "💥 Uncaught Exception");
    shutdown("uncaughtException");
  });
  
  // Unhandled promise rejections
  process.on("unhandledRejection", (reason) => {
    if (isShuttingDown) {
      logger.warn("⚠️ Unhandled Rejection after shutdown, ignoring");
      return;
    }
    logger.error({ reason }, "⚠️ Unhandled Rejection (logged, not crashing)");
  });
}

// Initialize the application
function initialize() {
  setupProcessHandlers();
  startServer();
}

// Start the server
initialize();
