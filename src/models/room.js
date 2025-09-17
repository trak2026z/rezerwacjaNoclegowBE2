// src/models/room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 5, maxlength: 50 },
    body: { type: String, required: true, minlength: 5, maxlength: 500 },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdAt: { type: Date, default: Date.now },

    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    dislikes: { type: Number, default: 0 },
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ✅ zmiana z reserve → reserved
    reserved: { type: Boolean, default: false },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    startAt: { type: Date },
    endsAt: { type: Date },

    // ✅ city wymagane
    city: { type: String, required: true },

    imgLink: { type: String, default: "https://picsum.photos/800/600" },
  },
  { timestamps: true }
);

// ✅ Walidacja daty: startAt < endsAt
roomSchema.pre("save", function (next) {
  if (this.startAt && this.endsAt && this.startAt >= this.endsAt) {
    return next(new Error("startAt must be earlier than endsAt"));
  }
  next();
});

module.exports = mongoose.model("Room", roomSchema);
