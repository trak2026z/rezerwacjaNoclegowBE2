const express = require('express');
const checkAuth = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.get('/checkEmail/:email', authController.checkEmail);
router.get('/checkUsername/:username', authController.checkUsername);
router.post('/login', authController.login);
router.get('/publicProfile/:username', authController.publicProfile);
router.get('/profile', checkAuth, authController.profile);

module.exports = router;
