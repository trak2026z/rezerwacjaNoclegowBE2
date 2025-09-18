/**
 * Router obsługujący ścieżki związane z uwierzytelnianiem i profilami użytkowników
 * @module routes/authentication
 */
const express = require("express");
const auth = require("@middleware/auth");
const authController = require("@controllers/authController");
const {
  validateRegister,
  validateLogin,
} = require("@middleware/validateAuthData");

const router = express.Router();

/**
 * Ścieżki związane z rejestracją i logowaniem
 */
router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);

/**
 * Ścieżki do walidacji dostępności danych użytkownika
 */
router.get("/checkEmail/:email", authController.checkEmail);
router.get("/checkUsername/:username", authController.checkUsername);

/**
 * Ścieżki związane z profilami użytkowników
 */
router.get("/publicProfile/:username", authController.publicProfile);
router.get("/profile", auth, authController.profile);

module.exports = router;
