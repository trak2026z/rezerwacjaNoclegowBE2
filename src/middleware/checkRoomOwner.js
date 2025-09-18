/**
 * Middleware do weryfikacji właściciela pokoju
 * Sprawdza czy zalogowany użytkownik jest właścicielem pokoju o podanym ID
 */
const Room = require("../models/Room");
const { NotFoundError, ForbiddenError } = require("../utils/errors");

/**
 * Stałe komunikaty błędów
 */
const ERROR_MESSAGES = {
  ROOM_NOT_FOUND: "Room not found",
  NOT_AUTHORIZED: "Not authorized to modify this room"
};

/**
 * Middleware sprawdzające czy zalogowany użytkownik jest właścicielem pokoju
 * 
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 * @param {Function} next - Funkcja przekazująca sterowanie do następnego middleware
 * @returns {void}
 */
async function checkRoomOwner(req, res, next) {
  try {
    // Pobierz pokój z bazy danych na podstawie ID z parametrów URL
    const room = await Room.findById(req.params.id);

    // Sprawdź czy pokój istnieje
    if (!room) {
      return next(new NotFoundError(ERROR_MESSAGES.ROOM_NOT_FOUND));
    }

    // Sprawdź czy zalogowany użytkownik jest właścicielem pokoju
    if (String(room.createdBy) !== req.user.userId) {
      return next(new ForbiddenError(ERROR_MESSAGES.NOT_AUTHORIZED));
    }

    // Dodaj pokój do obiektu żądania, aby kontroler mógł go używać
    req.room = room;
    
    // Przekaż sterowanie do następnego middleware
    return next();
  } catch (err) {
    // Obsłuż ewentualne błędy i przekaż je dalej
    return next(err);
  }
}

module.exports = checkRoomOwner;
