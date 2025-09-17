// src/repositories/userRepository.js
const User = require("../models/User");

async function createUser(data) {
  const user = new User(data);
  return user.save();
}

async function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

async function findByUsername(username) {
  return User.findOne({ username: username.toLowerCase() });
}

async function findById(id) {
  return User.findById(id).select("username email");
}

async function save(user) {
  return user.save();
}

module.exports = {
  createUser,
  findByEmail,
  findByUsername,
  findById,
  save,
};
