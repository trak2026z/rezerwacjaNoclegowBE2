// src/controllers/authController.js
const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");
const { NotFoundError } = require("../utils/errors");

// === Kontrolery ===

exports.register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: "Account registered!",
    data: { user, token },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body.username, req.body.password);

  return res.json({
    success: true,
    message: "Login successful!",
    data: { user, token },
  });
});

exports.checkEmail = asyncHandler(async (req, res) => {
  const taken = await authService.isEmailTaken(req.params.email);
  if (taken) {
    return res.status(409).json({
      success: false,
      message: "Email is already taken",
    });
  }
  return res.json({
    success: true,
    message: "Email is available",
  });
});

exports.checkUsername = asyncHandler(async (req, res) => {
  const taken = await authService.isUsernameTaken(req.params.username);
  if (taken) {
    return res.status(409).json({
      success: false,
      message: "Username is already taken",
    });
  }
  return res.json({
    success: true,
    message: "Username is available",
  });
});

exports.publicProfile = asyncHandler(async (req, res) => {
  const user = await authService.getPublicProfile(req.params.username);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return res.json({
    success: true,
    data: { user },
  });
});

exports.profile = asyncHandler(async (req, res) => {
  const user = await authService.getProfileById(req.user.userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return res.json({
    success: true,
    data: { user },
  });
});
