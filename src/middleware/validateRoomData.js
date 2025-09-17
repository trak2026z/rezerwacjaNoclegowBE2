// src/middleware/validateRoomData.js
const { BadRequestError } = require("../utils/errors");

function validateRoomData(req, res, next) {
  const { title, city, startAt, endsAt } = req.body;

  if (!title) throw new BadRequestError("Title is required");
  if (!city) throw new BadRequestError("City is required");
  if (!startAt || !endsAt) {
    throw new BadRequestError("Start and end dates are required");
  }

  next();
}

module.exports = validateRoomData;
