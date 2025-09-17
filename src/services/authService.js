// src/services/authService.js
const userRepository = require("../repositories/userRepository");
const tokenService = require("./tokenService");
const {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} = require("../utils/errors");

/**
 * Register new user
 */
async function registerUser({ email, username, password }) {
  const emailTaken = await userRepository.findByEmail(email);
  if (emailTaken) {
    throw new ConflictError("Email is already taken.");
  }

  const usernameTaken = await userRepository.findByUsername(username);
  if (usernameTaken) {
    throw new ConflictError("Username is already taken.");
  }

  const user = await userRepository.createUser({
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password,
  });

  const token = tokenService.generateToken(user._id);

  return {
    user: { _id: user._id, username: user.username, email: user.email },
    token,
  };
}

/**
 * Login user
 */
async function loginUser(username, password) {
  const user = await userRepository.findByUsername(username);
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  const validPassword = await user.comparePassword(password);
  if (!validPassword) {
    throw new UnauthorizedError("Invalid password.");
  }

  const token = tokenService.generateToken(user._id);

  return {
    user: { _id: user._id, username: user.username, email: user.email },
    token,
  };
}

/**
 * Check if email exists
 */
async function isEmailTaken(email) {
  return !!(await userRepository.findByEmail(email));
}

/**
 * Check if username exists
 */
async function isUsernameTaken(username) {
  return !!(await userRepository.findByUsername(username));
}

/**
 * Get public profile by username
 */
async function getPublicProfile(username) {
  const user = await userRepository.findByUsername(username);
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  return { username: user.username, email: user.email };
}

/**
 * Get profile by ID
 */
async function getProfileById(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  return { username: user.username, email: user.email };
}

module.exports = {
  registerUser,
  loginUser,
  isEmailTaken,
  isUsernameTaken,
  getPublicProfile,
  getProfileById,
};
