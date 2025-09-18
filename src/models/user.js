/**
 * Model użytkownika w systemie rezerwacji noclegów
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Stałe dla walidacji
 */
const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9]+$/,
    ERROR_MESSAGE: 'Username must be alphanumeric'
  },
  EMAIL: {
    PATTERN: /^\S+@\S+\.\S+$/,
    ERROR_MESSAGE: 'Invalid email format'
  },
  SALT_ROUNDS: 10
};

/**
 * Schemat użytkownika w bazie danych MongoDB
 */
const userSchema = new mongoose.Schema({
  // Dane logowania i identyfikacji
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [VALIDATION.EMAIL.PATTERN, VALIDATION.EMAIL.ERROR_MESSAGE]
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: VALIDATION.USERNAME.MIN_LENGTH,
    maxlength: VALIDATION.USERNAME.MAX_LENGTH,
    match: [VALIDATION.USERNAME.PATTERN, VALIDATION.USERNAME.ERROR_MESSAGE]
  },
  password: {
    type: String,
    required: true,
    minlength: VALIDATION.PASSWORD_MIN_LENGTH
  }
}, { timestamps: true });

/**
 * Middleware do hashowania hasła przed zapisem
 * Wykonuje się tylko gdy hasło zostało zmodyfikowane
 */
userSchema.pre('save', async function (next) {
  // Pomijamy hashowanie jeśli hasło nie zostało zmienione
  if (!this.isModified('password')) return next();
  
  try {
    // Generowanie soli i hashowanie hasła
    const salt = await bcrypt.genSalt(VALIDATION.SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Metoda do porównywania hasła z hashem zapisanym w bazie
 * @param {string} candidatePassword - Hasło do porównania
 * @returns {Promise<boolean>} - Wynik porównania
 */
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Konfiguracja transformacji do JSON
 * Usuwa pole password z odpowiedzi
 */
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

// Eksport modelu
module.exports = mongoose.model('User', userSchema);
