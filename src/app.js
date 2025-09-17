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

const app = express();

// Database Connection
mongoose
  .connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info({ uri: config.mongoUri }, "✅ Connected to MongoDB");
  })
  .catch((err) => {
    logger.fatal({ err }, "❌ Could NOT connect to MongoDB");
    process.exit(1); // bez bazy nie ma sensu startować serwera
  });

// Middleware
app.use(cors({ origin: config.corsOrigin || "*" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Request logging (requestId + userId jeśli dostępny)
app.use(httpLogger);

// Routes
app.use("/authentication", authentication);
app.use("/rooms", rooms);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Global error handler (ostatni w stacku)
app.use(errorHandler);

module.exports = app;
