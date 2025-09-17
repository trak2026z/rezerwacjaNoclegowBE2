// src/middleware/checkRoomOwner.js
const Room = require("../models/Room");
const { NotFoundError, ForbiddenError } = require("../utils/errors");

async function checkRoomOwner(req, res, next) {
  const room = await Room.findById(req.params.id);
  if (!room) {
    throw new NotFoundError("Room not found");
  }

  if (String(room.createdBy) !== req.user.userId) {
    throw new ForbiddenError("Not authorized to modify this room");
  }

  // Dodajemy pokój do req, żeby kontroler mógł go używać
  req.room = room;
  next();
}

module.exports = checkRoomOwner;
