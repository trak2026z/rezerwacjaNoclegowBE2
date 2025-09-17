// src/utils/logger.js
const pino = require("pino");
const pinoHttp = require("pino-http");
const { v4: uuidv4 } = require("uuid");

// Konfiguracja loggera bazowego
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true },
        }
      : undefined,
});

// Middleware do logowania requestów HTTP
const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers["x-request-id"] || uuidv4(),
  customProps: (req) => ({
    userId: req.user?.userId,
  }),
});

module.exports = {
  logger,
  httpLogger,
};
