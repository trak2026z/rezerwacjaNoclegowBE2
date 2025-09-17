// src/controllers/authController.js
const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

// === Kontrolery ===

exports.register = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const { user, token } = await authService.registerUser({ email, username, password });

  return res.status(201).json({
    success: true,
    message: "Account registered!",
    token,
    user,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const { user, token } = await authService.loginUser(username, password);

  return res.json({
    success: true,
    message: "Login successful!",
    token,
    user,
  });
});

exports.checkEmail = asyncHandler(async (req, res) => {
  const taken = await authService.isEmailTaken(req.params.email);
  if (taken) {
    return res.status(409).json({ success: false, message: "E-mail is already taken" });
  }
  return res.json({ success: true, message: "E-mail is available" });
});

exports.checkUsername = asyncHandler(async (req, res) => {
  const taken = await authService.isUsernameTaken(req.params.username);
  if (taken) {
    return res.status(409).json({ success: false, message: "Username is already taken" });
  }
  return res.json({ success: true, message: "Username is available" });
});

exports.publicProfile = asyncHandler(async (req, res) => {
  const user = await authService.getPublicProfile(req.params.username);
  return res.json({ success: true, user });
});

exports.profile = asyncHandler(async (req, res) => {
  const user = await authService.getProfileById(req.user.userId);
  return res.json({ success: true, user });
});
