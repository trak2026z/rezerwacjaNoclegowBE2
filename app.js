const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const config = require('./config'); // ✅ zamiast './config/database'
const authentication = require('./routes/authentication');
const rooms = require('./routes/rooms');

const app = express();

// Database Connection
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Connected to database: ${config.mongoUri}`))
  .catch(err => console.error('Could NOT connect to database:', err));

// Middleware
app.use(cors({ origin: config.corsOrigin || '*' })); // z config
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/authentication', authentication);
app.use('/rooms', rooms);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
