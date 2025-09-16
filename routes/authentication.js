const express = require('express');
const auth = require('../middleware/auth'); // ✅ ujednolicona nazwa
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validateAuthData'); // ✅ dodana walidacja

const router = express.Router();

// ✅ dodana walidacja przy rejestracji i logowaniu
router.post('/register', validateRegister, authController.register);
router.get('/checkEmail/:email', authController.checkEmail);
router.get('/checkUsername/:username', authController.checkUsername);
router.post('/login', validateLogin, authController.login);
router.get('/publicProfile/:username', authController.publicProfile);
router.get('/profile', auth, authController.profile);

module.exports = router;
