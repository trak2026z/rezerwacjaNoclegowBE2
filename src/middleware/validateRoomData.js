/**
 * Middleware walidacji danych pokoju
 * Sprawdza poprawność danych przy tworzeniu i aktualizacji pokoju
 */
const { BadRequestError } = require("../utils/errors");

/**
 * Stałe komunikaty błędów
 */
const ERROR_MESSAGES = {
  TITLE_REQUIRED: "Title is required",
  CITY_REQUIRED: "City is required",
  DATES_REQUIRED: "Start and end dates are required",
  BOTH_DATES_REQUIRED: "Both startAt and endsAt must be provided together",
  INVALID_DATE_FORMAT: "Invalid date format for startAt or endsAt",
  START_BEFORE_END: "Start date must be earlier than end date"
};

/**
 * Sprawdza poprawność dat
 * 
 * @param {string} startAt - Data początkowa
 * @param {string} endsAt - Data końcowa
 * @returns {Object} Obiekt zawierający informacje o błędach lub null jeśli daty są poprawne
 */
function validateDates(startAt, endsAt) {
  const startDate = new Date(startAt);
  const endDate = new Date(endsAt);

  // Sprawdzenie czy daty są poprawne
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { error: ERROR_MESSAGES.INVALID_DATE_FORMAT };
  }

  // Sprawdzenie czy data początkowa jest wcześniejsza niż końcowa
  if (startDate >= endDate) {
    return { error: ERROR_MESSAGES.START_BEFORE_END };
  }

  return null;
}

/**
 * Middleware walidacji danych pokoju
 * 
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 * @param {Function} next - Funkcja przekazująca sterowanie do następnego middleware
 * @returns {void}
 */
function validateRoomData(req, res, next) {
  try {
    const { title, city, startAt, endsAt } = req.body;

    // 🔹 Walidacja przy POST (tworzenie nowego pokoju)
    if (req.method === "POST") {
      // Sprawdzenie wymaganych pól
      if (!title) {
        return next(new BadRequestError(ERROR_MESSAGES.TITLE_REQUIRED));
      }

      if (!city) {
        return next(new BadRequestError(ERROR_MESSAGES.CITY_REQUIRED));
      }

      if (!startAt || !endsAt) {
        return next(new BadRequestError(ERROR_MESSAGES.DATES_REQUIRED));
      }

      // Walidacja dat
      const dateValidationResult = validateDates(startAt, endsAt);
      if (dateValidationResult) {
        return next(new BadRequestError(dateValidationResult.error));
      }
    }

    // 🔹 Walidacja przy PUT (aktualizacja istniejącego pokoju)
    if (req.method === "PUT") {
      // Jeśli ktoś aktualizuje daty, musi podać obie i muszą być poprawne
      if (startAt || endsAt) {
        if (!startAt || !endsAt) {
          return next(new BadRequestError(ERROR_MESSAGES.BOTH_DATES_REQUIRED));
        }

        // Walidacja dat
        const dateValidationResult = validateDates(startAt, endsAt);
        if (dateValidationResult) {
          return next(new BadRequestError(dateValidationResult.error));
        }
      }
    }

    // Wszystko OK → przechodzimy dalej
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = validateRoomData;
