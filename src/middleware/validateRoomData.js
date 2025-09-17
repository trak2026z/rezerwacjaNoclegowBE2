// src/middleware/validateRoomData.js
const { BadRequestError } = require("../utils/errors");

function validateRoomData(req, res, next) {
  try {
    const { title, city, startAt, endsAt } = req.body;

    // 🔹 Walidacja przy POST (tworzenie nowego pokoju)
    if (req.method === "POST") {
      if (!title) {
        return next(new BadRequestError("Title is required"));
      }

      if (!city) {
        return next(new BadRequestError("City is required"));
      }

      if (!startAt || !endsAt) {
        return next(new BadRequestError("Start and end dates are required"));
      }

      const startDate = new Date(startAt);
      const endDate = new Date(endsAt);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return next(new BadRequestError("Invalid date format for startAt or endsAt"));
      }

      if (startDate >= endDate) {
        return next(new BadRequestError("Start date must be earlier than end date"));
      }
    }

    // 🔹 Walidacja przy PUT (aktualizacja istniejącego pokoju)
    if (req.method === "PUT") {
      // Jeśli ktoś aktualizuje daty, musi podać obie i muszą być poprawne
      if (startAt || endsAt) {
        if (!startAt || !endsAt) {
          return next(new BadRequestError("Both startAt and endsAt must be provided together"));
        }

        const startDate = new Date(startAt);
        const endDate = new Date(endsAt);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return next(new BadRequestError("Invalid date format for startAt or endsAt"));
        }

        if (startDate >= endDate) {
          return next(new BadRequestError("Start date must be earlier than end date"));
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
