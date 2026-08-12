const cloudinary = require("cloudinary").v2;

// =====================================================
// CLOUDINARY CONFIGURATION
// =====================================================

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME;

const apiKey =
  process.env.CLOUDINARY_API_KEY;

const apiSecret =
  process.env.CLOUDINARY_API_SECRET;

// =====================================================
// VALIDATE ENVIRONMENT VARIABLES
// =====================================================

if (!cloudName) {
  console.error(
    "❌ CLOUDINARY_CLOUD_NAME is missing."
  );
}

if (!apiKey) {
  console.error(
    "❌ CLOUDINARY_API_KEY is missing."
  );
}

if (!apiSecret) {
  console.error(
    "❌ CLOUDINARY_API_SECRET is missing."
  );
}

// =====================================================
// CONFIG
// =====================================================

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

module.exports = cloudinary;