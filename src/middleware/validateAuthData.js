// src/middleware/validateAuthData.js
const { BadRequestError } = require("../utils/errors");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(req, res, next) {
  let { email, username, password } = req.body;

  // Normalizacja
  email = email?.toLowerCase().trim();
  username = username?.toLowerCase().trim();

  // Nadpisujemy req.body, żeby w serwisie mieć już oczyszczone wartości
  req.body.email = email;
  req.body.username = username;

  // Walidacja email
  if (!email) throw new BadRequestError("Email is required");
  if (!emailRegex.test(email)) throw new BadRequestError("Invalid email format");

  // Walidacja username
  if (!username) throw new BadRequestError("Username is required");
  if (username.length < 3) {
    throw new BadRequestError("Username must be at least 3 characters long");
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new BadRequestError("Username can only contain letters, numbers, and underscores");
  }

  // Walidacja password
  if (!password) throw new BadRequestError("Password is required");
  if (password.length < 8) {
    throw new BadRequestError("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    throw new BadRequestError("Password must include at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    throw new BadRequestError("Password must include at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    throw new BadRequestError("Password must include at least one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new BadRequestError("Password must include at least one special character");
  }

  next();
}

function validateLogin(req, res, next) {
  let { username, password } = req.body;

  username = username?.toLowerCase().trim();
  req.body.username = username;

  if (!username || !password) {
    throw new BadRequestError("Username and password are required");
  }

  next();
}

module.exports = { validateRegister, validateLogin };
