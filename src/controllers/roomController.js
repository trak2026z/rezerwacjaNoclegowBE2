const Room = require('../models/Room');
const asyncHandler = require('../utils/asyncHandler');

// ✅ wspólny helper do like/dislike
async function handleReaction(req, res, type) {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  const userId = req.user.userId;

  if (String(room.createdBy) === userId) {
    return res
      .status(400)
      .json({ success: false, message: `Cannot ${type} your own room.` });
  }

  const liked = room.likedBy.includes(userId);
  const disliked = room.dislikedBy.includes(userId);

  if (type === 'like') {
    if (liked) {
      return res
        .status(400)
        .json({ success: false, message: 'You already liked this room.' });
    }
    room.likedBy.push(userId);
    room.likes++;
    if (disliked) {
      room.dislikedBy = room.dislikedBy.filter((u) => String(u) !== userId);
      if (room.dislikes > 0) room.dislikes--;
    }
  } else if (type === 'dislike') {
    if (disliked) {
      return res
        .status(400)
        .json({ success: false, message: 'You already disliked this room.' });
    }
    room.dislikedBy.push(userId);
    room.dislikes++;
    if (liked) {
      room.likedBy = room.likedBy.filter((u) => String(u) !== userId);
      if (room.likes > 0) room.likes--;
    }
  }

  await room.save();
  return res.json({ success: true, message: `Room ${type}d!` });
}

// === Kontrolery ===

exports.createRoom = asyncHandler(async (req, res) => {
  const { title, body, startAt, endsAt, city } = req.body;
  const userId = req.user.userId;

  const room = new Room({
    title,
    body,
    createdBy: userId,
    createdAt: Date.now(), // ✅ zawsze ustawiane przez backend
    startAt,
    endsAt,
    city,
  });

  await room.save();
  return res.status(201).json({ success: true, message: 'Room created!', room });
});

exports.getAllRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({})
    .populate('createdBy', 'username email')
    .populate('reservedBy', 'username email')
    .sort({ _id: -1 });

  if (!rooms || rooms.length === 0) {
    return res.status(404).json({ success: false, message: 'No rooms found.' });
  }
  return res.json({ success: true, rooms });
});

exports.getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate('createdBy', 'username email')
    .populate('reservedBy', 'username email');

  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }
  return res.json({ success: true, room });
});

exports.updateRoom = asyncHandler(async (req, res) => {
  // room został dodany do req w middleware/checkRoomOwner
  Object.assign(req.room, req.body);
  await req.room.save();

  return res.json({
    success: true,
    message: 'Room updated!',
    room: req.room,
  });
});

exports.deleteRoom = asyncHandler(async (req, res) => {
  // room został dodany do req w middleware/checkRoomOwner
  await Room.deleteOne({ _id: req.room._id });
  return res.json({ success: true, message: 'Room deleted!' });
});

exports.likeRoom = asyncHandler((req, res) => handleReaction(req, res, 'like'));

exports.dislikeRoom = asyncHandler((req, res) => handleReaction(req, res, 'dislike'));

exports.reserveRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  const userId = req.user.userId;

  if (String(room.createdBy) === userId) {
    return res
      .status(400)
      .json({ success: false, message: 'Cannot reserve your own room.' });
  }

  if (room.reserve === true) {
    return res.status(409).json({ success: false, message: 'Room already reserved.' });
  }

  room.reservedBy = userId;
  room.reserve = true;

  await room.save();
  return res.json({ success: true, message: 'Room reserved!' });
});
