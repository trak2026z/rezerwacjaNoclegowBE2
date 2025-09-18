/**
 * Serwis obsługujący operacje związane z pokojami
 * @module services/roomService
 */
const roomRepository = require("../repositories/roomRepository");
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

/**
 * Tworzy nowy pokój w systemie
 * @param {Object} data - Dane pokoju do utworzenia
 * @param {string} userId - ID użytkownika tworzącego pokój
 * @returns {Promise<Object>} - Utworzony pokój
 */
async function createRoom(data, userId) {
  const room = await roomRepository.createRoom({
    ...data,
    createdBy: userId,
    createdAt: Date.now(),
  });

  return room;
}

/**
 * Pobiera wszystkie pokoje z systemu
 * @returns {Promise<Array>} - Lista wszystkich pokoi z uzupełnionymi danymi użytkowników
 */
async function getAllRooms() {
  return roomRepository.findAllRooms();
}

/**
 * Pobiera pokój na podstawie ID
 * @param {string} id - ID pokoju do pobrania
 * @returns {Promise<Object>} - Znaleziony pokój
 * @throws {NotFoundError} - Gdy pokój nie istnieje
 */
async function getRoomById(id) {
  const room = await roomRepository.findRoomById(id);
  if (!room) {
    throw new NotFoundError("Room not found.");
  }
  return room;
}

/**
 * Aktualizuje dane pokoju
 * @param {Object} room - Obiekt pokoju do aktualizacji
 * @param {Object} data - Nowe dane pokoju
 * @returns {Promise<Object>} - Zaktualizowany pokój
 * @throws {NotFoundError} - Gdy pokój nie istnieje
 */
async function updateRoom(room, data) {
  if (!room) {
    throw new NotFoundError("Room not found.");
  }
  return roomRepository.updateRoom(room, data);
}

/**
 * Usuwa pokój z systemu
 * @param {Object} room - Obiekt pokoju do usunięcia
 * @returns {Promise<Object>} - Wynik operacji usunięcia
 * @throws {NotFoundError} - Gdy pokój nie istnieje
 */
async function deleteRoom(room) {
  if (!room) {
    throw new NotFoundError("Room not found.");
  }
  return roomRepository.deleteRoom(room);
}

/**
 * Obsługuje reakcje użytkownika (polubienie/niepolubienie) na pokój
 * @param {Object} room - Obiekt pokoju
 * @param {string} userId - ID użytkownika wykonującego reakcję
 * @param {string} type - Typ reakcji ('like' lub 'dislike')
 * @returns {Promise<Object>} - Zaktualizowany pokój
 * @throws {NotFoundError} - Gdy pokój nie istnieje
 * @throws {BadRequestError} - Gdy użytkownik już wykonał daną reakcję lub typ reakcji jest nieprawidłowy
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
  } else {
    throw new BadRequestError("Invalid reaction type. Use 'like' or 'dislike'.");
  }

  return roomRepository.save(room);
}

/**
 * Rezerwuje pokój dla użytkownika
 * @param {Object} room - Obiekt pokoju do zarezerwowania
 * @param {string} userId - ID użytkownika dokonującego rezerwacji
 * @returns {Promise<Object>} - Zaktualizowany pokój z rezerwacją
 * @throws {NotFoundError} - Gdy pokój nie istnieje
 * @throws {ForbiddenError} - Gdy użytkownik próbuje zarezerwować własny pokój
 * @throws {ConflictError} - Gdy pokój jest już zarezerwowany
 */
async function reserveRoom(room, userId) {
  if (!room) {
    throw new NotFoundError("Room not found.");
  }

  // Zabezpieczenie na własny pokój
  const ownerId = room.createdBy._id ? String(room.createdBy._id) : String(room.createdBy);
  if (ownerId === String(userId)) {
    throw new ForbiddenError("You cannot reserve your own room.");
  }

  if (room.reserved) {
    throw new ConflictError("Room already reserved.");
  }

  room.reservedBy = userId;
  room.reserved = true;

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
