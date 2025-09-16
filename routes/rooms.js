const express = require('express');
const checkAuth = require('../middleware/auth');
const roomController = require('../controllers/roomController');

const router = express.Router();

router.post('/', roomController.createRoom);
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.put('/:id', checkAuth, roomController.updateRoom);
router.delete('/:id', checkAuth, roomController.deleteRoom);
router.post('/:id/like', checkAuth, roomController.likeRoom);
router.post('/:id/dislike', checkAuth, roomController.dislikeRoom);
router.post('/:id/reserve', checkAuth, roomController.reserveRoom);

module.exports = router;
