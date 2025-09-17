// src/services/authService.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} = require("../utils/errors");

/**
 * Generate JWT token
 */
function generateToken(userId) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "24h" });
}

/**
 * Register new user
 */
async function registerUser({ email, username, password }) {
  const emailTaken = await User.findOne({ email: email.toLowerCase() });
  if (emailTaken) {
    throw new ConflictError("Email is already taken.");
  }

  const usernameTaken = await User.findOne({
    username: username.toLowerCase(),
  });
  if (usernameTaken) {
    throw new ConflictError("Username is already taken.");
  }

  const user = new User({
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password,
  });

  await user.save();

  const token = generateToken(user._id);

  return {
    user: { _id: user._id, username: user.username, email: user.email },
    token,
  };
}

/**
 * Login user
 */
async function loginUser(username, password) {
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  const validPassword = await user.comparePassword(password);
  if (!validPassword) {
    throw new UnauthorizedError("Invalid password.");
  }

  const token = generateToken(user._id);

  return {
    user: { _id: user._id, username: user.username, email: user.email },
    token,
  };
}

/**
 * Check if email exists
 */
async function isEmailTaken(email) {
  const user = await User.findOne({ email });
  return !!user;
}

/**
 * Check if username exists
 */
async function isUsernameTaken(username) {
  const user = await User.findOne({ username });
  return !!user;
}

/**
 * Get public profile by username
 */
async function getPublicProfile(username) {
  const user = await User.findOne({ username }).select("username email");
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  return user;
}

/**
 * Get profile by ID
 */
async function getProfileById(userId) {
  const user = await User.findById(userId).select("username email");
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  return user;
}

module.exports = {
  registerUser,
  loginUser,
  isEmailTaken,
  isUsernameTaken,
  getPublicProfile,
  getProfileById,
};
