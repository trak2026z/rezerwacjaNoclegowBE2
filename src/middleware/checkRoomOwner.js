const Room = require('../models/Room');

async function checkRoomOwner(req, res, next) {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (String(room.createdBy) !== req.user.userId) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to modify this room' });
    }

    // dodajemy pokój do req, żeby nie pobierać ponownie w kontrolerze
    req.room = room;
    next();
  } catch (err) {
    next(err); // obsłuży errorHandler
  }
}

module.exports = checkRoomOwner;
