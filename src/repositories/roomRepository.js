// src/repositories/roomRepository.js
const Room = require("../models/Room");

async function createRoom(data) {
  const room = new Room(data);
  return room.save();
}

async function findAllRooms() {
  return Room.find({})
    .populate("createdBy", "username email")
    .populate("reservedBy", "username email")
    .sort({ _id: -1 });
}

async function findRoomById(id) {
  return Room.findById(id)
    .populate("createdBy", "username email")
    .populate("reservedBy", "username email");
}

async function updateRoom(room, data) {
  Object.assign(room, data);
  return room.save();
}

async function deleteRoom(room) {
  return Room.deleteOne({ _id: room._id });
}

async function save(room) {
  return room.save();
}

module.exports = {
  createRoom,
  findAllRooms,
  findRoomById,
  updateRoom,
  deleteRoom,
  save,
};
