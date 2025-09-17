// src/middleware/validateRoomData.js
const { BadRequestError } = require("../utils/errors");

function validateRoomData(req, res, next) {
  const { title, city, startAt, endsAt } = req.body;

  if (!title) {
    throw new BadRequestError("Title is required");
  }

  if (!city) {
    throw new BadRequestError("City is required");
  }

  if (!startAt || !endsAt) {
    throw new BadRequestError("Start and end dates are required");
  }

  const startDate = new Date(startAt);
  const endDate = new Date(endsAt);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new BadRequestError("Invalid date format for startAt or endsAt");
  }

  if (startDate >= endDate) {
    throw new BadRequestError("Start date must be earlier than end date");
  }

  // Wszystko OK → przechodzimy dalej
  next();
}

module.exports = validateRoomData;
