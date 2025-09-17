// src/middleware/checkRoomOwner.js
const Room = require("../models/Room");
const { NotFoundError, ForbiddenError } = require("../utils/errors");

async function checkRoomOwner(req, res, next) {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(new NotFoundError("Room not found"));
    }

    if (String(room.createdBy) !== req.user.userId) {
      return next(new ForbiddenError("Not authorized to modify this room"));
    }

    // Dodajemy pokój do req, żeby kontroler mógł go używać
    req.room = room;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = checkRoomOwner;
