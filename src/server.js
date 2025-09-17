// src/server.js
require('module-alias/register');
const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

// Start HTTP server
const server = app.listen(config.port, () => {
  console.log(`🚀 Server running in ${config.env || 'development'} mode on port ${config.port}`);
});

// Obsługa błędów serwera (np. port zajęty)
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n📴 Received ${signal}. Closing server...`);

  server.close(() => {
    console.log('✅ HTTP server closed.');

    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed.');
      process.exit(0);
    });
  });

  // Force exit jeśli coś się zawiesi
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after 10s');
    process.exit(1);
  }, 10000).unref();
};

// Obsługa sygnałów systemowych
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Obsługa błędów nieobsłużonych
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});
