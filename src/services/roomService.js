// src/services/roomService.js
const Room = require("../models/Room");
const { BadRequestError, ConflictError, NotFoundError } = require("../utils/errors");

/**
 * Create a new room
 */
async function createRoom(data, userId) {
  const { title, body, startAt, endsAt, city } = data;

  if (!title || !city) {
    throw new BadRequestError("Title and city are required.");
  }

  const room = new Room({
    title,
    body,
    createdBy: userId,
    createdAt: Date.now(),
    startAt,
    endsAt,
    city,
  });

  await room.save();
  return room;
}

/**
 * Get all rooms (with user info populated)
 */
async function getAllRooms() {
  return Room.find({})
    .populate("createdBy", "username email")
    .populate("reservedBy", "username email")
    .sort({ _id: -1 });
}

/**
 * Get a room by ID
 */
async function getRoomById(id) {
  const room = await Room.findById(id)
    .populate("createdBy", "username email")
    .populate("reservedBy", "username email");

  if (!room) {
    throw new NotFoundError("Room not found.");
  }

  return room;
}

/**
 * Update room with new data
 */
async function updateRoom(room, data) {
  if (!room) {
    throw new NotFoundError("Room not found.");
  }

  Object.assign(room, data);
  await room.save();
  return room;
}

/**
 * Delete room
 */
async function deleteRoom(room) {
  if (!room) {
    throw new NotFoundError("Room not found.");
  }

  await Room.deleteOne({ _id: room._id });
}

/**
 * Handle like/dislike logic
 */
async function handleReaction(room, userId, type) {
  if (!room) {
    throw new NotFoundError("Room not found.");
  }

  const liked = room.likedBy.includes(userId);
  const disliked = room.dislikedBy.includes(userId);

  if (type === "like") {
    if (liked) {
      throw new BadRequestError("You already liked this room.");
    }
    room.likedBy.push(userId);
    room.likes++;

    if (disliked) {
      room.dislikedBy = room.dislikedBy.filter((u) => String(u) !== userId);
      if (room.dislikes > 0) room.dislikes--;
    }
  } else if (type === "dislike") {
    if (disliked) {
      throw new BadRequestError("You already disliked this room.");
    }
    room.dislikedBy.push(userId);
    room.dislikes++;

    if (liked) {
      room.likedBy = room.likedBy.filter((u) => String(u) !== userId);
      if (room.likes > 0) room.likes--;
    }
  }

  await room.save();
  return room;
}

/**
 * Reserve room
 */
async function reserveRoom(room, userId) {
  if (!room) {
    throw new NotFoundError("Room not found.");
  }

  if (String(room.createdBy) === userId) {
    throw new BadRequestError("Cannot reserve your own room.");
  }
  if (room.reserve === true) {
    throw new ConflictError("Room already reserved.");
  }

  room.reservedBy = userId;
  room.reserve = true;

  await room.save();
  return room;
}

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  handleReaction,
  reserveRoom,
};
