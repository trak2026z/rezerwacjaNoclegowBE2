/**
 * Serwis obsługujący operacje uwierzytelniania i zarządzania użytkownikami
 * @module services/authService
 */
// src/services/authService.js
const userRepository = require("../repositories/userRepository");
const tokenService = require("./tokenService");
const {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} = require("../utils/errors");

/**
 * Rejestruje nowego użytkownika w systemie
 * @param {Object} userData - Dane nowego użytkownika
 * @param {string} userData.email - Adres email użytkownika
 * @param {string} userData.username - Nazwa użytkownika
 * @param {string} userData.password - Hasło użytkownika
 * @returns {Promise<Object>} - Obiekt zawierający dane użytkownika i token
 * @throws {ConflictError} - Gdy email lub nazwa użytkownika są już zajęte
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
 * Loguje użytkownika do systemu
 * @param {string} username - Nazwa użytkownika
 * @param {string} password - Hasło użytkownika
 * @returns {Promise<Object>} - Obiekt zawierający dane użytkownika i token
 * @throws {NotFoundError} - Gdy użytkownik nie istnieje
 * @throws {UnauthorizedError} - Gdy hasło jest nieprawidłowe
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
 * Sprawdza czy adres email jest już zajęty
 * @param {string} email - Adres email do sprawdzenia
 * @returns {Promise<boolean>} - True jeśli email jest zajęty, false w przeciwnym razie
 */
async function isEmailTaken(email) {
  return !!(await userRepository.findByEmail(email));
}

/**
 * Sprawdza czy nazwa użytkownika jest już zajęta
 * @param {string} username - Nazwa użytkownika do sprawdzenia
 * @returns {Promise<boolean>} - True jeśli nazwa jest zajęta, false w przeciwnym razie
 */
async function isUsernameTaken(username) {
  return !!(await userRepository.findByUsername(username));
}

/**
 * Pobiera publiczny profil użytkownika na podstawie nazwy użytkownika
 * @param {string} username - Nazwa użytkownika
 * @returns {Promise<Object>} - Publiczne dane użytkownika
 * @throws {NotFoundError} - Gdy użytkownik nie istnieje
 */
async function getPublicProfile(username) {
  const user = await userRepository.findByUsername(username);
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  return { username: user.username, email: user.email };
}

/**
 * Pobiera profil użytkownika na podstawie ID
 * @param {string} userId - ID użytkownika
 * @returns {Promise<Object>} - Dane profilu użytkownika
 * @throws {NotFoundError} - Gdy użytkownik nie istnieje
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
