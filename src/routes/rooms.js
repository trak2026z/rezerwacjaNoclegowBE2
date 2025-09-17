const express = require('express');
const auth = require('../middleware/auth');
const roomController = require('../controllers/roomController');
const checkRoomOwner = require('../middleware/checkRoomOwner');
const validateRoomData = require('../middleware/validateRoomData');

const router = express.Router();

// Create room → wymaga logowania + walidacji danych
router.post('/', auth, validateRoomData, roomController.createRoom);

// Publiczne endpointy
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);

// Update / delete → wymaga logowania + właściciela pokoju
router.put('/:id', auth, checkRoomOwner, roomController.updateRoom);
router.delete('/:id', auth, checkRoomOwner, roomController.deleteRoom);

// Like / dislike / reserve → tylko logowanie, właściciel niepotrzebny
router.post('/:id/like', auth, roomController.likeRoom);
router.post('/:id/dislike', auth, roomController.dislikeRoom);
router.post('/:id/reserve', auth, roomController.reserveRoom);

module.exports = router;
