/**
 * Repozytorium do obsługi operacji na pokojach w bazie danych
 * @module repositories/roomRepository
 */
// src/repositories/roomRepository.js
const Room = require("../models/Room");

/**
 * Pola do wypełnienia przy pobieraniu danych użytkownika
 */
const USER_POPULATE_FIELDS = "username email";

/**
 * Tworzy nowy pokój w bazie danych
 * @param {Object} data - Dane nowego pokoju
 * @returns {Promise<Object>} - Utworzony pokój
 */
async function createRoom(data) {
  const room = new Room(data);
  return room.save();
}

/**
 * Pobiera wszystkie pokoje z bazy danych
 * @returns {Promise<Array>} - Lista wszystkich pokoi
 */
async function findAllRooms() {
  return Room.find({})
    .populate("createdBy", USER_POPULATE_FIELDS)
    .populate("reservedBy", USER_POPULATE_FIELDS)
    .sort({ _id: -1 });
}

/**
 * Wyszukuje pokój po identyfikatorze
 * @param {string} id - Identyfikator pokoju
 * @returns {Promise<Object|null>} - Znaleziony pokój lub null
 */
async function findRoomById(id) {
  return Room.findById(id)
    .populate("createdBy", USER_POPULATE_FIELDS)
    .populate("reservedBy", USER_POPULATE_FIELDS);
}

/**
 * Aktualizuje dane pokoju
 * @param {Object} room - Obiekt pokoju do aktualizacji
 * @param {Object} data - Nowe dane pokoju
 * @returns {Promise<Object>} - Zaktualizowany pokój
 */
async function updateRoom(room, data) {
  Object.assign(room, data);
  return room.save();
}

/**
 * Usuwa pokój z bazy danych
 * @param {Object} room - Obiekt pokoju do usunięcia
 * @returns {Promise<Object>} - Wynik operacji usunięcia
 */
async function deleteRoom(room) {
  return Room.deleteOne({ _id: room._id });
}

/**
 * Zapisuje zmiany w obiekcie pokoju
 * @param {Object} room - Obiekt pokoju do zapisania
 * @returns {Promise<Object>} - Zapisany pokój
 */
async function save(room) {
  return room.save();
}

// Eksport funkcji repozytorium
module.exports = {
  createRoom,
  findAllRooms,
  findRoomById,
  updateRoom,
  deleteRoom,
  save,
};
