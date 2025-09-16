const User = require('../models/User');
const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
  try {
    const { title, body, createdAt, startAt, endsAt, city } = req.body;
    const userId = req.decoded.userId; // bierzemy z JWT

    if (!title || !body || !userId) {
      return res.status(400).json({ success: false, message: 'Title, body and creator are required' });
    }

    const room = new Room({ title, body, createdBy: userId, createdAt, startAt, endsAt, city });
    await room.save();

    return res.status(201).json({ success: true, message: 'Room created!', room });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({})
      .populate('createdBy', 'username email')
      .populate('reservedBy', 'username email')
      .sort({ _id: -1 });

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'No rooms found.' });
    }
    return res.json({ success: true, rooms });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('reservedBy', 'username email');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }
    return res.json({ success: true, room });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    if (String(room.createdBy) !== req.decoded.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this room.' });
    }

    Object.assign(room, req.body);
    await room.save();

    return res.json({ success: true, message: 'Room updated!', room });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (String(room.createdBy) !== req.decoded.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
    }

    await Room.deleteOne({ _id: req.params.id });
    return res.json({ success: true, message: 'Room deleted!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.likeRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const userId = req.decoded.userId;

    if (String(room.createdBy) === userId) {
      return res.status(400).json({ success: false, message: 'Cannot like your own room.' });
    }

    if (room.likedBy.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You already liked this room.' });
    }

    room.likedBy.push(userId);
    room.likes++;

    if (room.dislikedBy.includes(userId)) {
      room.dislikedBy = room.dislikedBy.filter(u => String(u) !== userId);
      if (room.dislikes > 0) room.dislikes--;
    }

    await room.save();
    return res.json({ success: true, message: 'Room liked!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.dislikeRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const userId = req.decoded.userId;

    if (String(room.createdBy) === userId) {
      return res.status(400).json({ success: false, message: 'Cannot dislike your own room.' });
    }

    if (room.dislikedBy.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You already disliked this room.' });
    }

    room.dislikedBy.push(userId);
    room.dislikes++;

    if (room.likedBy.includes(userId)) {
      room.likedBy = room.likedBy.filter(u => String(u) !== userId);
      if (room.likes > 0) room.likes--;
    }

    await room.save();
    return res.json({ success: true, message: 'Room disliked!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.reserveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const userId = req.decoded.userId;

    if (String(room.createdBy) === userId) {
      return res.status(400).json({ success: false, message: 'Cannot reserve your own room.' });
    }

    if (room.reserve === true) {
      return res.status(409).json({ success: false, message: 'Room already reserved.' });
    }

    room.reservedBy = userId;
    room.reserve = true;

    await room.save();
    return res.json({ success: true, message: 'Room reserved!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
