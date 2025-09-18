/**
 * Repozytorium do obsługi operacji na użytkownikach w bazie danych
 * @module repositories/userRepository
 */
// src/repositories/userRepository.js
const User = require("../models/User");

/**
 * Pola użytkownika zwracane przy podstawowych zapytaniach
 */
const DEFAULT_USER_FIELDS = "username email";

/**
 * Tworzy nowego użytkownika w bazie danych
 * @param {Object} data - Dane nowego użytkownika
 * @returns {Promise<Object>} - Utworzony użytkownik
 */
async function createUser(data) {
  const user = new User(data);
  return user.save();
}

/**
 * Wyszukuje użytkownika po adresie email
 * @param {string} email - Adres email użytkownika
 * @returns {Promise<Object|null>} - Znaleziony użytkownik lub null
 */
async function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

/**
 * Wyszukuje użytkownika po nazwie użytkownika
 * @param {string} username - Nazwa użytkownika
 * @returns {Promise<Object|null>} - Znaleziony użytkownik lub null
 */
async function findByUsername(username) {
  return User.findOne({ username: username.toLowerCase() });
}

/**
 * Wyszukuje użytkownika po identyfikatorze
 * @param {string} id - Identyfikator użytkownika
 * @returns {Promise<Object|null>} - Znaleziony użytkownik lub null
 */
async function findById(id) {
  return User.findById(id).select(DEFAULT_USER_FIELDS);
}

/**
 * Zapisuje zmiany w obiekcie użytkownika
 * @param {Object} user - Obiekt użytkownika do zapisania
 * @returns {Promise<Object>} - Zapisany użytkownik
 */
async function save(user) {
  return user.save();
}

// Eksport funkcji repozytorium
module.exports = {
  createUser,
  findByEmail,
  findByUsername,
  findById,
  save,
};
