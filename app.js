const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const config = require('./config');
const authentication = require('./routes/authentication');
const rooms = require('./routes/rooms');
const errorHandler = require('./middleware/errorHandler'); // ✅ używamy dedykowanego middleware

const app = express();

// Database Connection
mongoose
  .connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

// Global error handler (ostatni w stacku)
app.use(errorHandler);

module.exports = app;
