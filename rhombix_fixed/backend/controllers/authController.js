const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================================================
// VALIDATION HELPERS
// =====================================================

// =====================================================
// GMAIL VALIDATION
// =====================================================

const gmailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i;

// =====================================================
// USERNAME VALIDATION
// =====================================================
// 3–20 characters
//
// Allowed:
// Letters
// Numbers
// Underscore
// Special characters
//
// Spaces are NOT allowed.
//
// Examples:
// adnan123        ✅
// adnan_123       ✅
// adnan@123       ✅
// adnan.dev       ✅
// adnan-dev       ✅
// adnan!123       ✅
// @adnan          ✅
// adnan#dev       ✅
// user$name       ✅
//
// Examples rejected:
// ab              ❌ (less than 3)
// abcdefghijklmnopqrstuvwxyz ❌ (more than 20)
// adnan user      ❌ (space)
//

const usernameRegex = /^[^\s]{3,20}$/;

// =====================================================
// STRONG PASSWORD VALIDATION
// =====================================================
// Minimum 8 characters
// 1 uppercase
// 1 lowercase
// 1 number
// 1 special character

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

// =====================================================
// CREATE JWT
// =====================================================

const createToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// =====================================================
// FORMAT USER
// =====================================================

const formatUser = (user) => {
  return {
    id: user._id,
    name: user.name || "",
    username: user.username || "",
    email: user.email || "",
    bio: user.bio || "",
    profilePicture: user.profilePicture || "",
  };
};

// =====================================================
// REGISTER USER
// =====================================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      confirmPassword,
      termsAccepted,
      acceptTerms,
      acceptPrivacy,
    } = req.body;

    // =================================================
    // 1. REQUIRED FIELDS
    // =================================================

    if (
      !name ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // =================================================
    // 2. TERMS & PRIVACY
    // =================================================

    const finalTermsAccepted =
      termsAccepted === true ||
      (acceptTerms === true &&
        acceptPrivacy === true);

    if (!finalTermsAccepted) {
      return res.status(400).json({
        success: false,
        message:
          "You must agree to the Terms & Conditions and Privacy Policy.",
      });
    }

    // =================================================
    // 3. CLEAN VALUES
    // =================================================

    const cleanName = name.trim();

    const cleanUsername =
      username.trim().toLowerCase();

    const cleanEmail =
      email.trim().toLowerCase();

    // =================================================
    // 4. NAME VALIDATION
    // =================================================

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Full name must contain at least 2 characters.",
      });
    }

    // =================================================
    // 5. USERNAME VALIDATION
    // =================================================

    if (!usernameRegex.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username must be between 3 and 20 characters and must not contain spaces.",
      });
    }

    // =================================================
    // 6. GMAIL VALIDATION
    // =================================================

    if (!gmailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid Gmail address ending with @gmail.com.",
      });
    }

    // =================================================
    // 7. PASSWORD VALIDATION
    // =================================================

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
      });
    }

    // =================================================
    // 8. CONFIRM PASSWORD
    // =================================================

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // =================================================
    // 9. CHECK EXISTING EMAIL
    // =================================================

    const existingEmail = await User.findOne({
      email: cleanEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    // =================================================
    // 10. CHECK EXISTING USERNAME
    // =================================================

    const existingUsername =
      await User.findOne({
        username: cleanUsername,
      });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken.",
      });
    }

    // =================================================
    // 11. HASH PASSWORD
    // =================================================

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // =================================================
    // 12. CREATE USER
    // =================================================

    const user = await User.create({
      name: cleanName,

      username: cleanUsername,

      email: cleanEmail,

      password: hashedPassword,

      bio: "",

      profilePicture: "",

      termsAccepted: true,

      termsAcceptedAt: new Date(),
    });

    // =================================================
    // 13. CREATE JWT
    // =================================================

    const token = createToken(user._id);

    // =================================================
    // 14. RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully.",

      token,

      user: formatUser(user),
    });
  } catch (error) {
    console.error(
      "Register Error:",
      error
    );

    // ===============================================
    // DUPLICATE KEY
    // ===============================================

    if (error.code === 11000) {
      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      if (duplicateField === "email") {
        return res.status(400).json({
          success: false,
          message:
            "Email is already registered.",
        });
      }

      if (duplicateField === "username") {
        return res.status(400).json({
          success: false,
          message:
            "Username is already taken.",
        });
      }
    }

    // ===============================================
    // MONGOOSE VALIDATION
    // ===============================================

    if (
      error.name ===
      "ValidationError"
    ) {
      const firstError =
        Object.values(
          error.errors
        )[0];

      return res.status(400).json({
        success: false,
        message:
          firstError?.message ||
          "Invalid user data.",
      });
    }

    // ===============================================
    // SERVER ERROR
    // ===============================================

    return res.status(500).json({
      success: false,
      message:
        "Server error during registration.",
    });
  }
};

// =====================================================
// LOGIN USER
// =====================================================

const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // =================================================
    // 1. REQUIRED FIELDS
    // =================================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    // =================================================
    // 2. CLEAN EMAIL
    // =================================================

    const cleanEmail =
      email.trim().toLowerCase();

    // =================================================
    // 3. GMAIL VALIDATION
    // =================================================

    if (!gmailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid Gmail address ending with @gmail.com.",
      });
    }

    // =================================================
    // 4. FIND USER
    // =================================================

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // =================================================
    // 5. COMPARE PASSWORD
    // =================================================

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // =================================================
    // 6. CREATE JWT
    // =================================================

    const token =
      createToken(user._id);

    // =================================================
    // 7. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Login successful.",

      token,

      user: formatUser(user),
    });
  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during login.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  registerUser,
  loginUser,
};