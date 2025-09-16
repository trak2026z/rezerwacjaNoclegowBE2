const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const config = require('./config');
const authentication = require('./routes/authentication');
const rooms = require('./routes/rooms');

const app = express();

// Database Connection
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`✅ Connected to MongoDB at: ${config.mongoUri}`);
  })
  .catch((err) => {
    console.error('❌ Could NOT connect to MongoDB:', err.message);
    process.exit(1); // bez bazy nie ma sensu startować serwera
  });

// Middleware
app.use(cors({ origin: config.corsOrigin || '*' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/authentication', authentication);
app.use('/rooms', rooms);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler (na wszelki wypadek)
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
