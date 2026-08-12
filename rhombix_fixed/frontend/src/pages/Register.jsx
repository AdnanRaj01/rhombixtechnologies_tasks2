import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { registerUser } from "../services/api";

import { useAuth } from "../context/AuthContext";

// =====================================================
// ICONS
// =====================================================

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="register-input-icon"
      aria-hidden="true"
    >
      <path
        d="M20 21a8 8 0 0 0-16 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle
        cx="12"
        cy="7"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function UsernameIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="register-input-icon"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M9 10.5h6M9 14h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="register-input-icon"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="m4 7 8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="register-input-icon"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="eye-icon"
        aria-hidden="true"
      >
        <path
          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        <circle
          cx="12"
          cy="12"
          r="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="eye-icon"
      aria-hidden="true"
    >
      <path
        d="m3 3 18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M10.6 6.2A10.4 10.4 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-3.1 3.5M6.2 6.9C3.9 8.6 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="field-check-icon"
      aria-hidden="true"
    >
      <path
        d="m5 12 4 4L19 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="register-arrow-icon"
      aria-hidden="true"
    >
      <path
        d="M5 12h13M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// =====================================================
// VALIDATION
// =====================================================

const validateName = (name) => {
  const value = name.trim();

  if (!value) {
    return "Full name is required.";
  }

  if (value.length < 2) {
    return "Full name must contain at least 2 characters.";
  }

  if (!/^[A-Za-zÀ-ÿ\s.'-]+$/.test(value)) {
    return "Please enter a valid full name.";
  }

  return "";
};

// =====================================================
// USERNAME VALIDATION
// 3–20 characters
// Letters + numbers + underscore + special characters
// =====================================================

const validateUsername = (username) => {
  const value = username.trim();

  // Required
  if (!value) {
    return "Username is required.";
  }

  // Minimum length
  if (value.length < 3) {
    return "Username must be at least 3 characters.";
  }

  // Maximum length
  if (value.length > 20) {
    return "Username must not exceed 20 characters.";
  }

  // Spaces are not allowed.
  // Letters, numbers, underscore and special characters are allowed.
  if (/\s/.test(value)) {
    return "Username must not contain spaces.";
  }

  return "";
};

const validateGmail = (email) => {
  const value =
    email.trim().toLowerCase();

  if (!value) {
    return "Gmail address is required.";
  }

  const gmailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i;

  if (!gmailRegex.test(value)) {
    return "Please enter a valid Gmail address ending with @gmail.com.";
  }

  return "";
};

const validatePassword = (password) => {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least 1 uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least 1 lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least 1 number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least 1 special character.";
  }

  return "";
};

// =====================================================
// REGISTER COMPONENT
// =====================================================

export default function Register() {
  const navigate = useNavigate();

  const { login } = useAuth();

  // =====================================================
  // FORM STATE
  // =====================================================

  const [formData, setFormData] =
    useState({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  // =====================================================
  // UI STATE
  // =====================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [touched, setTouched] =
    useState({
      name: false,
      username: false,
      email: false,
      password: false,
      confirmPassword: false,
    });

  // =====================================================
  // TERMS + PRIVACY
  // =====================================================

  const [acceptTerms, setAcceptTerms] =
    useState(false);

  const [acceptPrivacy, setAcceptPrivacy] =
    useState(false);

  // =====================================================
  // FIELD VALIDATION
  // =====================================================

  const getFieldError = (field) => {
    switch (field) {
      case "name":
        return validateName(
          formData.name
        );

      case "username":
        return validateUsername(
          formData.username
        );

      case "email":
        return validateGmail(
          formData.email
        );

      case "password":
        return validatePassword(
          formData.password
        );

      case "confirmPassword":

        if (!formData.confirmPassword) {
          return "Please confirm your password.";
        }

        if (
          formData.password !==
          formData.confirmPassword
        ) {
          return "Passwords do not match.";
        }

        return "";

      default:
        return "";
    }
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (touched[name]) {
      setTouched((previous) => ({
        ...previous,
        [name]: true,
      }));
    }

    if (
      name === "password" &&
      touched.confirmPassword
    ) {
      setTouched((previous) => ({
        ...previous,
        confirmPassword: true,
      }));
    }

    setError("");
  };

  // =====================================================
  // HANDLE BLUR
  // =====================================================

  const handleBlur = (field) => {
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
  };

  // =====================================================
  // CLOSE SUCCESS ALERT
  // =====================================================

  const closeSuccessAlert = () => {
    setSuccess("");

    navigate("/feed", {
      replace: true,
    });
  };

  // =====================================================
  // HANDLE REGISTER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    setSuccess("");

    // =================================================
    // ALL FIELDS TOUCHED
    // =================================================

    setTouched({
      name: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // =================================================
    // CLEAN VALUES
    // =================================================

    const name =
      formData.name.trim();

    const username =
      formData.username.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const password =
      formData.password;

    const confirmPassword =
      formData.confirmPassword;

    // =================================================
    // VALIDATE
    // =================================================

    const nameError =
      validateName(name);

    const usernameError =
      validateUsername(username);

    const emailError =
      validateGmail(email);

    const passwordError =
      validatePassword(password);

    let confirmPasswordError = "";

    if (!confirmPassword) {
      confirmPasswordError =
        "Please confirm your password.";
    } else if (
      password !== confirmPassword
    ) {
      confirmPasswordError =
        "Passwords do not match.";
    }

    // =================================================
    // VALIDATION CHECK
    // =================================================

    if (
      nameError ||
      usernameError ||
      emailError ||
      passwordError ||
      confirmPasswordError
    ) {
      return;
    }

    // =================================================
    // TERMS + PRIVACY
    // =================================================

    if (
      !acceptTerms ||
      !acceptPrivacy
    ) {
      setError(
        "Please accept the Terms & Conditions and Privacy Policy."
      );

      return;
    }

    // =================================================
    // API REQUEST
    // =================================================

    try {
      setLoading(true);

      const registrationData = {
        name,
        username,
        email,
        password,
        confirmPassword,
        acceptTerms,
        acceptPrivacy,
      };

      console.log(
        "Registration data:",
        registrationData
      );

      const data =
        await registerUser(
          registrationData
        );

      console.log(
        "Registration response:",
        data
      );

      // =================================================
      // SAFETY CHECK
      // =================================================

      if (
        !data ||
        !data.token ||
        !data.user
      ) {
        throw new Error(
          "Registration succeeded but authentication data was not returned."
        );
      }

      // =================================================
      // AUTH CONTEXT
      // =================================================

      login(
        data.token,
        data.user
      );

      // =================================================
      // SUCCESS ALERT ON REGISTER PAGE
      // =================================================

      setSuccess(
        "Account Created Successfully"
      );

      // =================================================
      // REDIRECT AFTER 2 SECONDS
      // =================================================

      setTimeout(() => {
        navigate("/feed", {
          replace: true,
        });
      }, 2000);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FIELD ERRORS
  // =====================================================

  const nameError =
    touched.name
      ? getFieldError("name")
      : "";

  const usernameError =
    touched.username
      ? getFieldError("username")
      : "";

  const emailError =
    touched.email
      ? getFieldError("email")
      : "";

  const passwordError =
    touched.password
      ? getFieldError("password")
      : "";

  const confirmPasswordError =
    touched.confirmPassword
      ? getFieldError(
          "confirmPassword"
        )
      : "";

  // =====================================================
  // VALID STATES
  // =====================================================

  const isNameValid =
    touched.name &&
    formData.name &&
    !nameError;

  const isUsernameValid =
    touched.username &&
    formData.username &&
    !usernameError;

  const isEmailValid =
    touched.email &&
    formData.email &&
    !emailError;

  const isPasswordValid =
    touched.password &&
    formData.password &&
    !passwordError;

  const isConfirmPasswordValid =
    touched.confirmPassword &&
    formData.confirmPassword &&
    !confirmPasswordError;

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="register-page">

      {/* =================================================
          SUCCESS ALERT
      ================================================= */}

      {success && (
        <div
          className="register-success-alert"
          role="alert"
        >
          <span className="register-success-icon">
            ✓
          </span>

          <span className="register-success-message">
            {success}
          </span>

          <button
            type="button"
            className="register-success-close"
            onClick={closeSuccessAlert}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="register-bg-circle register-bg-circle-one" />

      <div className="register-bg-circle register-bg-circle-two" />

      <div className="register-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="register-header">

          <div className="register-logo">
            <UserIcon />
          </div>

          <h1>
            Create Account
          </h1>

          <p>
            Join Rhombix Social Network and
            connect with your community.
          </p>

        </div>

        {/* =================================================
            GENERAL ERROR
        ================================================= */}

        {error && (
          <div
            className="register-general-error"
            role="alert"
          >
            <span>!</span>

            {error}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          noValidate
        >

          {/* =================================================
              NAME
          ================================================= */}

          <div className="register-form-group">

            <label htmlFor="name">

              Full Name

              <span className="required-star">
                *
              </span>

            </label>

            <div
              className={`register-input-wrapper ${
                nameError
                  ? "input-error"
                  : isNameValid
                  ? "input-valid"
                  : ""
              }`}
            >

              <div className="input-icon-zone">
                <UserIcon />
              </div>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="enter your full name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() =>
                  handleBlur("name")
                }
                autoComplete="name"
              />

              {isNameValid && (
                <div className="input-status-zone">
                  <CheckIcon />
                </div>
              )}

            </div>

            {nameError && (
              <p className="field-error">

                <span>⚠</span>

                {nameError}

              </p>
            )}

          </div>

          {/* =================================================
              USERNAME
          ================================================= */}

          <div className="register-form-group">

            <label htmlFor="username">

              Username

              <span className="required-star">
                *
              </span>

            </label>

            <div
              className={`register-input-wrapper ${
                usernameError
                  ? "input-error"
                  : isUsernameValid
                  ? "input-valid"
                  : ""
              }`}
            >

              <div className="input-icon-zone">
                <UsernameIcon />
              </div>

              <input
                id="username"
                type="text"
                name="username"
                placeholder="@username"
                value={formData.username}
                onChange={handleChange}
                onBlur={() =>
                  handleBlur("username")
                }
                autoComplete="username"
                maxLength={20}
              />

              {isUsernameValid && (
                <div className="input-status-zone">
                  <CheckIcon />
                </div>
              )}

            </div>

            {!usernameError && (
              <p className="field-hint">
                3–20 characters. Letters,
                numbers, underscores and
                special characters are allowed.
              </p>
            )}

            {usernameError && (
              <p className="field-error">

                <span>⚠</span>

                {usernameError}

              </p>
            )}

          </div>

          {/* =================================================
              GMAIL
          ================================================= */}

          <div className="register-form-group">

            <label htmlFor="email">

              Gmail Address

              <span className="required-star">
                *
              </span>

            </label>

            <div
              className={`register-input-wrapper ${
                emailError
                  ? "input-error"
                  : isEmailValid
                  ? "input-valid"
                  : ""
              }`}
            >

              <div className="input-icon-zone">
                <MailIcon />
              </div>

              <input
                id="email"
                type="text"
                name="email"
                placeholder="adnan@gmail.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={() =>
                  handleBlur("email")
                }
                autoComplete="email"
                spellCheck="false"
              />

              {isEmailValid && (
                <div className="input-status-zone">
                  <CheckIcon />
                </div>
              )}

            </div>

            {!emailError &&
              !isEmailValid && (
                <p className="field-hint">
                  Use a valid Gmail address
                  ending with @gmail.com.
                </p>
              )}

            {emailError && (
              <p className="field-error">

                <span>⚠</span>

                {emailError}

              </p>
            )}

          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="register-form-group">

            <label htmlFor="password">

              Password

              <span className="required-star">
                *
              </span>

            </label>

            <div
              className={`register-input-wrapper password-wrapper ${
                passwordError
                  ? "input-error"
                  : isPasswordValid
                  ? "input-valid"
                  : ""
              }`}
            >

              <div className="input-icon-zone">
                <LockIcon />
              </div>

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() =>
                  handleBlur("password")
                }
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-eye-btn"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <EyeIcon
                  visible={showPassword}
                />
              </button>

              {isPasswordValid && (
                <div className="input-status-zone password-status">
                  <CheckIcon />
                </div>
              )}

            </div>

            {!passwordError && (
              <p className="field-hint">
                Minimum 8 characters with
                uppercase, lowercase, number
                and special character.
              </p>
            )}

            {passwordError && (
              <p className="field-error">

                <span>⚠</span>

                {passwordError}

              </p>
            )}

          </div>

          {/* =================================================
              CONFIRM PASSWORD
          ================================================= */}

          <div className="register-form-group">

            <label htmlFor="confirmPassword">

              Confirm Password

              <span className="required-star">
                *
              </span>

            </label>

            <div
              className={`register-input-wrapper password-wrapper ${
                confirmPasswordError
                  ? "input-error"
                  : isConfirmPasswordValid
                  ? "input-valid"
                  : ""
              }`}
            >

              <div className="input-icon-zone">
                <LockIcon />
              </div>

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={
                  formData.confirmPassword
                }
                onChange={handleChange}
                onBlur={() =>
                  handleBlur(
                    "confirmPassword"
                  )
                }
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-eye-btn"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) =>
                      !previous
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >

                <EyeIcon
                  visible={
                    showConfirmPassword
                  }
                />

              </button>

              {isConfirmPasswordValid && (
                <div className="input-status-zone password-status">
                  <CheckIcon />
                </div>
              )}

            </div>

            {confirmPasswordError && (
              <p className="field-error">

                <span>⚠</span>

                {confirmPasswordError}

              </p>
            )}

          </div>

          {/* =================================================
              TERMS + PRIVACY
          ================================================= */}

          <div className="agreement-section">

            <label className="agreement-label">

              <input
                type="checkbox"
                checked={
                  acceptTerms &&
                  acceptPrivacy
                }
                onChange={(e) => {

                  const checked =
                    e.target.checked;

                  setAcceptTerms(
                    checked
                  );

                  setAcceptPrivacy(
                    checked
                  );

                  setError("");

                }}
              />

              <span className="custom-checkbox">

                {acceptTerms &&
                  acceptPrivacy && (
                    <span>✓</span>
                  )}

              </span>

              <span className="agreement-text">

                <b>
                  I agree to{" "}
                </b>

                <a
                  href="#terms"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <b>
                    Terms & Conditions
                  </b>
                </a>

                {" "}and{" "}

                <a
                  href="#privacy"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <b>
                    Privacy Policy
                  </b>
                </a>

              </span>

            </label>

          </div>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            className="register-submit-btn"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="register-spinner" />

                Creating Account...
              </>
            ) : (
              <>
                <b>
                  Create Account
                </b>

                <ArrowIcon />
              </>
            )}

          </button>

        </form>

        {/* =================================================
            LOGIN LINK
        ================================================= */}

        <p className="register-login-text">

          Already have an account?{" "}

          <Link to="/login">

            <b>
              Login
            </b>

          </Link>

        </p>

      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="register-footer">

        <div>

          <span className="footer-icon">
            ✓
          </span>

          Secure Registration

        </div>

        <span className="footer-divider" />

        <div>

          <span className="footer-icon">
            🔒
          </span>

          Your data is safe

        </div>

        <span className="footer-divider" />

        <div>

          <span className="footer-icon">
            👥
          </span>

          Join our community

        </div>

      </div>

    </div>
  );
}