const express = require("express");

const {
  getProfile,
  updateProfile,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET logged-in user
router.get(
  "/me",
  authMiddleware,
  getProfile
);

// UPDATE logged-in user
router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

module.exports = router;