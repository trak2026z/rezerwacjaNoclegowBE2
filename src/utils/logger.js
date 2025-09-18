/**
 * Moduł konfigurujący system logowania aplikacji
 * @module utils/logger
 */
// src/utils/logger.js
const pino = require("pino");
const pinoHttp = require("pino-http");
const { v4: uuidv4 } = require("uuid");

/**
 * Konfiguracja głównego loggera aplikacji
 * Używa pino-pretty w środowisku deweloperskim dla czytelnych, kolorowych logów
 * @type {import('pino').Logger}
 */
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

/**
 * Middleware do logowania żądań HTTP
 * Generuje unikalne ID dla każdego żądania i dołącza informacje o użytkowniku
 * @type {import('pino-http').HttpLogger}
 */
const httpLogger = pinoHttp({
  logger,
  // Używa nagłówka x-request-id jeśli istnieje, w przeciwnym razie generuje nowe UUID
  genReqId: (req) => req.headers["x-request-id"] || uuidv4(),
  // Dołącza ID użytkownika do logów, jeśli użytkownik jest zalogowany
  customProps: (req) => ({
    userId: req.user?.userId,
  }),
});

module.exports = {
  logger,
  httpLogger,
};
