const app = require('./app');
const config = require('./config');
const mongoose = require('mongoose');

const server = app.listen(config.port, () => {
  console.log(`🚀 Server running in ${config.env} mode on port ${config.port}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n📴 Received ${signal}. Closing server...`);
  server.close(() => {
    console.log('✅ HTTP server closed.');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
