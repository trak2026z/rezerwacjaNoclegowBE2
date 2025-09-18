/**
 * Router obsługujący ścieżki związane z pokojami
 * @module routes/rooms
 */
const express = require("express");
const auth = require("../middleware/auth");
const roomController = require("../controllers/roomController");
const checkRoomOwner = require("../middleware/checkRoomOwner");
const validateRoomData = require("../middleware/validateRoomData");

const router = express.Router();

/**
 * Tworzenie pokoju
 * Wymaga uwierzytelnienia i walidacji danych
 */
router.post("/", auth, validateRoomData, roomController.createRoom);

/**
 * Publiczne endpointy do pobierania informacji o pokojach
 * Dostępne bez uwierzytelnienia
 */
router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getRoomById);

/**
 * Aktualizacja i usuwanie pokoju
 * Wymaga uwierzytelnienia i bycia właścicielem pokoju
 */
router.put("/:id", auth, checkRoomOwner, validateRoomData, roomController.updateRoom);
router.delete("/:id", auth, checkRoomOwner, roomController.deleteRoom);

/**
 * Interakcje z pokojem (polubienia, rezerwacje)
 * Wymaga tylko uwierzytelnienia, nie wymaga bycia właścicielem
 */
router.post("/:id/like", auth, roomController.likeRoom);
router.post("/:id/dislike", auth, roomController.dislikeRoom);
router.post("/:id/reserve", auth, roomController.reserveRoom);

module.exports = router;
