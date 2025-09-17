// src/middleware/validateAuthData.js
const { BadRequestError } = require("../utils/errors");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(req, res, next) {
  try {
    let { email, username, password } = req.body;

    // Normalizacja
    email = email?.toLowerCase().trim();
    username = username?.toLowerCase().trim();

    // Nadpisujemy req.body, żeby w serwisie mieć już oczyszczone wartości
    req.body.email = email;
    req.body.username = username;

    // Walidacja email
    if (!email) return next(new BadRequestError("Email is required"));
    if (!emailRegex.test(email)) return next(new BadRequestError("Invalid email format"));

    // Walidacja username
    if (!username) return next(new BadRequestError("Username is required"));
    if (username.length < 3) {
      return next(new BadRequestError("Username must be at least 3 characters long"));
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return next(new BadRequestError("Username can only contain letters, numbers, and underscores"));
    }

    // Walidacja password
    if (!password) return next(new BadRequestError("Password is required"));
    if (password.length < 8) {
      return next(new BadRequestError("Password must be at least 8 characters long"));
    }
    if (!/[A-Z]/.test(password)) {
      return next(new BadRequestError("Password must include at least one uppercase letter"));
    }
    if (!/[a-z]/.test(password)) {
      return next(new BadRequestError("Password must include at least one lowercase letter"));
    }
    if (!/[0-9]/.test(password)) {
      return next(new BadRequestError("Password must include at least one number"));
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return next(new BadRequestError("Password must include at least one special character"));
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

function validateLogin(req, res, next) {
  try {
    let { username, password } = req.body;

    username = username?.toLowerCase().trim();
    req.body.username = username;

    if (!username || !password) {
      return next(new BadRequestError("Username and password are required"));
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { validateRegister, validateLogin };
