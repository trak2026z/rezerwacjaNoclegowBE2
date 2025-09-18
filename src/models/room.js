/**
 * Model pokoju w systemie rezerwacji noclegów
 */
// src/models/room.js
const mongoose = require("mongoose");

/**
 * Stałe dla walidacji
 */
const VALIDATION = {
  TEXT_LENGTHS: {
    TITLE: {
      MIN: 5,
      MAX: 50
    },
    BODY: {
      MIN: 5,
      MAX: 500
    }
  },
  DEFAULT_IMAGE: "https://picsum.photos/800/600",
  ERROR_MESSAGES: {
    DATE_VALIDATION: "startAt must be earlier than endsAt"
  }
};

/**
 * Schemat pokoju w bazie danych MongoDB
 */
const roomSchema = new mongoose.Schema(
  {
    // Podstawowe informacje o pokoju
    title: { 
      type: String, 
      required: true, 
      minlength: VALIDATION.TEXT_LENGTHS.TITLE.MIN, 
      maxlength: VALIDATION.TEXT_LENGTHS.TITLE.MAX 
    },
    body: { 
      type: String, 
      required: true, 
      minlength: VALIDATION.TEXT_LENGTHS.BODY.MIN, 
      maxlength: VALIDATION.TEXT_LENGTHS.BODY.MAX 
    },
    city: { 
      type: String, 
      required: true 
    }, // ✅ city wymagane
    imgLink: { 
      type: String, 
      default: VALIDATION.DEFAULT_IMAGE 
    },

    // Informacje o twórcy
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },

    // System ocen
    likes: { 
      type: Number, 
      default: 0 
    },
    likedBy: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    dislikes: { 
      type: Number, 
      default: 0 
    },
    dislikedBy: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],

    // Informacje o rezerwacji
    reserved: { 
      type: Boolean, 
      default: false 
    }, // ✅ zmiana z reserve → reserved
    reservedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    startAt: { 
      type: Date 
    },
    endsAt: { 
      type: Date 
    },
  },
  { timestamps: true }
);

/**
 * Middleware walidacji przed zapisem
 * Sprawdza czy data początkowa jest wcześniejsza niż końcowa
 */
// ✅ Walidacja daty: startAt < endsAt
roomSchema.pre("save", function (next) {
  if (this.startAt && this.endsAt && this.startAt >= this.endsAt) {
    return next(new Error(VALIDATION.ERROR_MESSAGES.DATE_VALIDATION));
  }
  next();
});

/**
 * Metoda statyczna do wyszukiwania dostępnych pokoi w danym okresie
 * @param {Date} startDate - Data początkowa
 * @param {Date} endDate - Data końcowa
 * @returns {Promise<Array>} - Lista dostępnych pokoi
 */
roomSchema.statics.findAvailable = function(startDate, endDate) {
  return this.find({
    $or: [
      { reserved: false },
      { 
        $and: [
          { reserved: true },
          { 
            $or: [
              { endsAt: { $lt: startDate } },
              { startAt: { $gt: endDate } }
            ]
          }
        ]
      }
    ]
  });
};

// Eksport modelu
const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
