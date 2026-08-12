// =====================================================
// ENVIRONMENT
// =====================================================

const dotenv = require("dotenv");

dotenv.config();

// =====================================================
// IMPORTS
// =====================================================

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  }),
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "2mb",
  }),
);

// =====================================================
// ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/posts", postRoutes);

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Rhombix Social Network API is running.",
  });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error(
    "Global Error:",
    err,
  );

  // -----------------------------
  // MULTER ERROR
  // -----------------------------

  if (err instanceof multer.MulterError) {
    if (
      err.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "File size exceeds the allowed limit.",
      });
    }

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "File upload error.",
    });
  }

  // -----------------------------
  // NORMAL ERROR
  // -----------------------------

  return res.status(500).json({
    success: false,
    message:
      err.message ||
      "Internal server error.",
  });
});

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`,
  );
});