const express = require("express");
const auth = require("@middleware/auth");
const authController = require("@controllers/authController");
const {
  validateRegister,
  validateLogin,
} = require("@middleware/validateAuthData");

const router = express.Router();

// Rejestracja i logowanie
router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);

// Walidacja dostępności danych
router.get("/checkEmail/:email", authController.checkEmail);
router.get("/checkUsername/:username", authController.checkUsername);

// Profile
router.get("/publicProfile/:username", authController.publicProfile);
router.get("/profile", auth, authController.profile);

module.exports = router;
