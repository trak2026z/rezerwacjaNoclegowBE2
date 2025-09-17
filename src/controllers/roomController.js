// src/controllers/roomController.js
const asyncHandler = require("../utils/asyncHandler");
const roomService = require("../services/roomService");

// === Kontrolery ===

exports.createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoom(req.body, req.user.userId);
  return res
    .status(201)
    .json({ success: true, message: "Room created!", room });
});

exports.getAllRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.getAllRooms();
  if (!rooms || rooms.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "No rooms found." });
  }
  return res.json({ success: true, rooms });
});

exports.getRoomById = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.id);
  return res.json({ success: true, room });
});

exports.updateRoom = asyncHandler(async (req, res) => {
  const updated = await roomService.updateRoom(req.room, req.body);
  return res.json({ success: true, message: "Room updated!", room: updated });
});

exports.deleteRoom = asyncHandler(async (req, res) => {
  await roomService.deleteRoom(req.room);
  return res.json({ success: true, message: "Room deleted!" });
});

exports.likeRoom = asyncHandler(async (req, res) => {
  const room = await roomService.handleReaction(
    req.room ?? (await roomService.getRoomById(req.params.id)),
    req.user.userId,
    "like"
  );
  return res.json({ success: true, message: "Room liked!", room });
});

exports.dislikeRoom = asyncHandler(async (req, res) => {
  const room = await roomService.handleReaction(
    req.room ?? (await roomService.getRoomById(req.params.id)),
    req.user.userId,
    "dislike"
  );
  return res.json({ success: true, message: "Room disliked!", room });
});

exports.reserveRoom = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.id);
  const reserved = await roomService.reserveRoom(room, req.user.userId);
  return res.json({ success: true, message: "Room reserved!", room: reserved });
});
