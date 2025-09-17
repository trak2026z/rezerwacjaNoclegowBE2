// src/services/roomService.js
const roomRepository = require("../repositories/roomRepository");
const { BadRequestError, ConflictError, NotFoundError } = require("../utils/errors");

/**
 * Create a new room
 */
async function createRoom(data, userId) {
  const { title, city } = data;

  if (!title || !city) {
    throw new BadRequestError("Title and city are required.");
  }

  const room = await roomRepository.createRoom({
    ...data,
    createdBy: userId,
    createdAt: Date.now(),
  });

  return room;
}

/**
 * Get all rooms (with user info populated)
 */
async function getAllRooms() {
  return roomRepository.findAllRooms();
}

/**
 * Get a room by ID
 */
async function getRoomById(id) {
  const room = await roomRepository.findRoomById(id);
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
  return roomRepository.updateRoom(room, data);
}

/**
 * Delete room
 */
async function deleteRoom(room) {
  if (!room) {
    throw new NotFoundError("Room not found.");
  }
  return roomRepository.deleteRoom(room);
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

  return roomRepository.save(room);
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

  return roomRepository.save(room);
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
