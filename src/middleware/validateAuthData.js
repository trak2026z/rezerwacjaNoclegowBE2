/**
 * Middleware walidacji danych uwierzytelniania
 * Sprawdza poprawność danych rejestracji i logowania
 */
const { BadRequestError } = require("../utils/errors");

/**
 * Stałe dla walidacji
 */
const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME_REGEX: /^[a-zA-Z0-9_]+$/,
  PASSWORD_REQUIREMENTS: {
    UPPERCASE_REGEX: /[A-Z]/,
    LOWERCASE_REGEX: /[a-z]/,
    NUMBER_REGEX: /[0-9]/,
    SPECIAL_CHAR_REGEX: /[!@#$%^&*(),.?":{}|<>]/
  },
  MIN_LENGTHS: {
    USERNAME: 3,
    PASSWORD: 8
  }
};

/**
 * Komunikaty błędów
 */
const ERROR_MESSAGES = {
  EMAIL: {
    REQUIRED: "Email is required",
    INVALID_FORMAT: "Invalid email format"
  },
  USERNAME: {
    REQUIRED: "Username is required",
    TOO_SHORT: "Username must be at least 3 characters long",
    INVALID_CHARS: "Username can only contain letters, numbers, and underscores"
  },
  PASSWORD: {
    REQUIRED: "Password is required",
    TOO_SHORT: "Password must be at least 8 characters long",
    NO_UPPERCASE: "Password must include at least one uppercase letter",
    NO_LOWERCASE: "Password must include at least one lowercase letter",
    NO_NUMBER: "Password must include at least one number",
    NO_SPECIAL_CHAR: "Password must include at least one special character"
  },
  LOGIN: {
    CREDENTIALS_REQUIRED: "Username and password are required"
  }
};

/**
 * Normalizuje dane wejściowe
 * 
 * @param {Object} data - Dane do normalizacji
 * @returns {Object} Znormalizowane dane
 */
function normalizeAuthData(data) {
  const normalized = { ...data };
  
  if (normalized.email) {
    normalized.email = normalized.email.toLowerCase().trim();
  }
  
  if (normalized.username) {
    normalized.username = normalized.username.toLowerCase().trim();
  }
  
  return normalized;
}

/**
 * Middleware walidacji danych rejestracji
 * 
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 * @param {Function} next - Funkcja przekazująca sterowanie do następnego middleware
 * @returns {void}
 */
function validateRegister(req, res, next) {
  try {
    // Pobierz dane z żądania
    let { email, username, password } = req.body;

    // Normalizacja danych
    const normalized = normalizeAuthData({ email, username });
    email = normalized.email;
    username = normalized.username;

    // Nadpisujemy req.body, żeby w serwisie mieć już oczyszczone wartości
    req.body.email = email;
    req.body.username = username;

    // Walidacja email
    if (!email) return next(new BadRequestError(ERROR_MESSAGES.EMAIL.REQUIRED));
    if (!VALIDATION.EMAIL_REGEX.test(email)) return next(new BadRequestError(ERROR_MESSAGES.EMAIL.INVALID_FORMAT));

    // Walidacja username
    if (!username) return next(new BadRequestError(ERROR_MESSAGES.USERNAME.REQUIRED));
    if (username.length < VALIDATION.MIN_LENGTHS.USERNAME) {
      return next(new BadRequestError(ERROR_MESSAGES.USERNAME.TOO_SHORT));
    }
    if (!VALIDATION.USERNAME_REGEX.test(username)) {
      return next(new BadRequestError(ERROR_MESSAGES.USERNAME.INVALID_CHARS));
    }

    // Walidacja password
    if (!password) return next(new BadRequestError(ERROR_MESSAGES.PASSWORD.REQUIRED));
    if (password.length < VALIDATION.MIN_LENGTHS.PASSWORD) {
      return next(new BadRequestError(ERROR_MESSAGES.PASSWORD.TOO_SHORT));
    }
    if (!VALIDATION.PASSWORD_REQUIREMENTS.UPPERCASE_REGEX.test(password)) {
      return next(new BadRequestError(ERROR_MESSAGES.PASSWORD.NO_UPPERCASE));
    }
    if (!VALIDATION.PASSWORD_REQUIREMENTS.LOWERCASE_REGEX.test(password)) {
      return next(new BadRequestError(ERROR_MESSAGES.PASSWORD.NO_LOWERCASE));
    }
    if (!VALIDATION.PASSWORD_REQUIREMENTS.NUMBER_REGEX.test(password)) {
      return next(new BadRequestError(ERROR_MESSAGES.PASSWORD.NO_NUMBER));
    }
    if (!VALIDATION.PASSWORD_REQUIREMENTS.SPECIAL_CHAR_REGEX.test(password)) {
      return next(new BadRequestError(ERROR_MESSAGES.PASSWORD.NO_SPECIAL_CHAR));
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Middleware walidacji danych logowania
 * 
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 * @param {Function} next - Funkcja przekazująca sterowanie do następnego middleware
 * @returns {void}
 */
function validateLogin(req, res, next) {
  try {
    let { username, password } = req.body;

    // Normalizacja username
    const normalized = normalizeAuthData({ username });
    username = normalized.username;
    req.body.username = username;

    // Sprawdzenie czy podano wymagane dane
    if (!username || !password) {
      return next(new BadRequestError(ERROR_MESSAGES.LOGIN.CREDENTIALS_REQUIRED));
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { validateRegister, validateLogin };
