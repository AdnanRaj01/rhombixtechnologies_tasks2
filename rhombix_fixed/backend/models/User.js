const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =====================================================
    // FULL NAME
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    // =====================================================
    // USERNAME
    // =====================================================

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 20,
    },

    // =====================================================
    // GMAIL
    // =====================================================

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // =====================================================
    // PASSWORD
    // =====================================================
    // IMPORTANT:
    // Password database mein hashed form mein store hoga.
    // Plain-text password kabhi store nahi hoga.

    password: {
      type: String,
      required: true,
    },

    // =====================================================
    // BIO
    // =====================================================

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // =====================================================
    // PROFILE PICTURE
    // =====================================================

    profilePicture: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // TERMS & CONDITIONS / PRIVACY POLICY
    // =====================================================

    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Exact time when user accepted the agreement
    termsAcceptedAt: {
      type: Date,
      default: null,
    },
  },

  // =======================================================
  // TIMESTAMPS
  // =======================================================

  {
    timestamps: true,
  }
);

// =========================================================
// EXPORT MODEL
// =========================================================

module.exports = mongoose.model("User", userSchema);