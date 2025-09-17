// src/server.js
require("module-alias/register");
const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config");
const { logger } = require("./utils/logger");

// Start HTTP server
const server = app.listen(config.port, () => {
  logger.info(
    { env: config.env, port: config.port },
    `🚀 Server running in ${config.env || "development"} mode on port ${config.port}`
  );
});

// Obsługa błędów serwera (np. port zajęty)
server.on("error", (err) => {
  logger.error({ err }, "❌ Server error");
  process.exit(1);
});

let isShuttingDown = false;

// Graceful shutdown
const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn({ signal }, `📴 Received ${signal}. Closing server...`);

  server.close(() => {
    logger.info("✅ HTTP server closed.");

    mongoose.connection.close(false, () => {
      logger.info("✅ MongoDB connection closed.");
      process.exit(0);
    });
  });

  // Force exit jeśli coś się zawiesi
  setTimeout(() => {
    logger.fatal("⚠️ Forced shutdown after 10s");
    process.exit(1);
  }, 10000).unref();
};

// Obsługa sygnałów systemowych
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Obsługa błędów nieobsłużonych
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "💥 Uncaught Exception");
  shutdown("uncaughtException");
});

// 🚑 Unhandled Rejection → logujemy, ale jeśli serwer się zamyka, ignorujemy
process.on("unhandledRejection", (reason) => {
  if (isShuttingDown) {
    logger.warn("⚠️ Unhandled Rejection after shutdown, ignoring");
    return;
  }
  logger.error({ reason }, "⚠️ Unhandled Rejection (logged, not crashing)");
});
