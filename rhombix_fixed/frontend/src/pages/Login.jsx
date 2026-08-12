import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../services/api";

import { useAuth } from "../context/AuthContext";

// =======================================================
// PASSWORD RULE COMPONENT
// =======================================================

function PasswordRule({ valid, children }) {
  return (
    <li
      className={
        valid
          ? "password-rule valid"
          : "password-rule"
      }
    >
      <span>{valid ? "✓" : "○"}</span>

      {children}
    </li>
  );
}

// =======================================================
// LOGIN PAGE
// =======================================================

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  // =======================================================
  // FORM STATE
  // =======================================================

  const [formData, setFormData] = useState(() => ({
    email:
      localStorage.getItem("savedEmail") || "",
    password: "",
  }));

  // =======================================================
  // UI STATE
  // =======================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [submitted, setSubmitted] =
    useState(false);

  // =======================================================
  // EMAIL VALIDATION
  // =======================================================

  const validateEmail = (email) => {
    const gmailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i;

    return gmailRegex.test(
      email.trim()
    );
  };

  // =======================================================
  // PASSWORD VALIDATION
  // =======================================================

  const validatePassword = (password) => {
    return {
      minLength:
        password.length >= 8,

      uppercase:
        /[A-Z]/.test(password),

      lowercase:
        /[a-z]/.test(password),

      number:
        /[0-9]/.test(password),

      special:
        /[^A-Za-z0-9]/.test(password),
    };
  };

  const passwordRules =
    validatePassword(formData.password);

  const passwordValid =
    passwordRules.minLength &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.special;

  const emailValid =
    validateEmail(formData.email);

  // =======================================================
  // EMAIL ERROR
  // =======================================================

  const getEmailError = () => {
    if (!formData.email.trim()) {
      return "Gmail address is required.";
    }

    if (!emailValid) {
      return "Please enter a valid Gmail address ending with @gmail.com.";
    }

    return "";
  };

  // =======================================================
  // PASSWORD ERROR
  // =======================================================

  const getPasswordError = () => {
    if (!formData.password) {
      return "Password is required.";
    }

    if (!passwordValid) {
      return "Password does not meet the required security rules.";
    }

    return "";
  };

  const emailError =
    (touched.email || submitted) &&
    !emailValid
      ? getEmailError()
      : "";

  const passwordError =
    (touched.password || submitted) &&
    !passwordValid
      ? getPasswordError()
      : "";

  // =======================================================
  // HANDLE INPUT
  // =======================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setServerError("");
  };

  // =======================================================
  // HANDLE BLUR
  // =======================================================

  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((previous) => ({
      ...previous,
      [name]: true,
    }));
  };

  // =======================================================
  // CLOSE SUCCESS ALERT
  // =======================================================

  const closeSuccessAlert = () => {
    setSuccess("");

    navigate("/feed", {
      replace: true,
    });
  };

  // =======================================================
  // HANDLE LOGIN
  // =======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitted(true);

    setServerError("");

    setSuccess("");

    // =====================================================
    // FRONTEND VALIDATION
    // =====================================================

    if (
      !emailValid ||
      !passwordValid
    ) {
      return;
    }

    try {
      setLoading(true);

      const email =
        formData.email.trim();

      // =================================================
      // LOGIN API
      // =================================================

      const data =
        await loginUser({
          email,
          password:
            formData.password,
        });

      console.log(
        "Login response:",
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
          "Invalid login response from server."
        );
      }

      // =================================================
      // REMEMBER EMAIL
      // =================================================

      if (rememberMe) {
        localStorage.setItem(
          "rememberedEmail",
          email
        );
      } else {
        localStorage.removeItem(
          "rememberedEmail"
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
      // SHOW SUCCESS ALERT ON LOGIN PAGE
      // =================================================

      setSuccess(
        "Login Successful"
      );

      // =================================================
      // AUTO REDIRECT AFTER 2 SECONDS
      // =================================================

      setTimeout(() => {
        navigate("/feed", {
          replace: true,
        });
      }, 2000);

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setServerError(
        error.message ||
          "Unable to login. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="auth-page login-page">

      {/* =================================================
          SUCCESS ALERT
      ================================================= */}

      {success && (
        <div
          className="login-success-alert"
          role="alert"
        >
          <span className="login-success-icon">
            ✓
          </span>

          <span className="login-success-message">
            {success}
          </span>

          <button
            type="button"
            className="login-success-close"
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

      <div className="auth-bg-circle auth-bg-circle-one"></div>

      <div className="auth-bg-circle auth-bg-circle-two"></div>

      {/* =================================================
          LOGIN CARD
      ================================================= */}

      <div className="login-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="login-header">

          <div className="login-icon">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

              <circle
                cx="9"
                cy="7"
                r="4"
              />

              <path d="M19 8v6" />

              <path d="M22 11h-6" />
            </svg>

          </div>

          <h1>
            Welcome Back
          </h1>

          <p>
            Login to your Rhombix Social Network account
          </p>

        </div>

        {/* =================================================
            SERVER ERROR
        ================================================= */}

        {serverError && (
          <div className="login-server-error">

            <div className="server-error-icon">
              !
            </div>

            <div>

              <strong>
                Login failed
              </strong>

              <span>
                {serverError}
              </span>

            </div>

          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="login-form-group">

            <label htmlFor="email">
              Gmail Address
            </label>

            <div
              className={`input-wrapper ${
                emailError
                  ? "input-error"
                  : touched.email &&
                    emailValid
                  ? "input-success"
                  : ""
              }`}
            >

              <span className="input-icon">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >

                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />

                  <path d="m3 7 9 6 9-6" />

                </svg>

              </span>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="adnan@gmail.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
              />

              {touched.email &&
                emailValid && (
                  <span className="input-success-icon">
                    ✓
                  </span>
                )}

            </div>

            {emailError && (
              <p className="field-error">

                <span>!</span>

                {emailError}

              </p>
            )}

          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="login-form-group">

            <div className="password-label-row">

              <label htmlFor="password">
                Password
              </label>

            </div>

            <div
              className={`input-wrapper password-wrapper ${
                passwordError
                  ? "input-error"
                  : touched.password &&
                    passwordValid
                  ? "input-success"
                  : ""
              }`}
            >

              <span className="input-icon">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >

                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                  />

                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />

                </svg>

              </span>

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="current-password"
              />

              {/* EYE TOGGLE */}

              <button
                type="button"
                className="password-toggle"
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

                {showPassword ? (

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <path d="M3 3l18 18" />

                    <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />

                    <path d="M9.88 4.24A9.77 9.77 0 0 1 12 4c5 0 9 5 9 8a8.9 8.9 0 0 1-2.16 3.4" />

                    <path d="M6.61 6.61C4.63 7.96 3 10.07 3 12c0 3 4 8 9 8a9.6 9.6 0 0 0 3.77-.77" />

                  </svg>

                ) : (

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                    />

                  </svg>

                )}

              </button>

            </div>

            {/* PASSWORD ERROR */}

            {passwordError && (
              <div className="password-validation">

                <p className="field-error password-main-error">

                  <span>!</span>

                  Password does not meet the security requirements.

                </p>

                <div className="password-rules-box">

                  <p className="password-rules-title">
                    Password must contain:
                  </p>

                  <ul>

                    <PasswordRule
                      valid={
                        passwordRules.minLength
                      }
                    >
                      Minimum 8 characters
                    </PasswordRule>

                    <PasswordRule
                      valid={
                        passwordRules.uppercase
                      }
                    >
                      1 uppercase letter
                    </PasswordRule>

                    <PasswordRule
                      valid={
                        passwordRules.lowercase
                      }
                    >
                      1 lowercase letter
                    </PasswordRule>

                    <PasswordRule
                      valid={
                        passwordRules.number
                      }
                    >
                      1 number
                    </PasswordRule>

                    <PasswordRule
                      valid={
                        passwordRules.special
                      }
                    >
                      1 special character
                    </PasswordRule>

                  </ul>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              REMEMBER ME
          ================================================= */}

          <div className="login-options">

            <label className="remember-label">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
              />

              <span className="custom-checkbox"></span>

              <span>
                Remember me
              </span>

            </label>

            <button
              type="button"
              className="forgot-password-btn"
              onClick={() => {
                alert(
                  "Password recovery will be available soon."
                );
              }}
            >
              Forgot password?
            </button>

          </div>

          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="professional-login-btn"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="login-spinner"></span>

                Signing in...
              </>
            ) : (
              <b>
                Login
              </b>
            )}

          </button>

        </form>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="login-divider">

          <span></span>

          <p>OR</p>

          <span></span>

        </div>

        {/* =================================================
            GOOGLE LOGIN
        ================================================= */}

        <button
          type="button"
          className="google-login-btn"
          onClick={() => {
            alert(
              "Google login will be available after Google OAuth is configured on the backend."
            );
          }}
        >

          <span className="google-icon">
            G
          </span>

          <span>
            Continue with Google
          </span>

        </button>

        {/* =================================================
            REGISTER
        ================================================= */}

        <p className="login-register-text">

          Don't have an account?{" "}

          <Link to="/register">

            <b>
              Create Account
            </b>

          </Link>

        </p>

        {/* =================================================
            SECURITY INFO
        ================================================= */}

        <div className="login-security">

          <div>

            <span className="security-icon">
              ✓
            </span>

            <span>
              Secure Login
            </span>

          </div>

          <div>

            <span className="security-icon">
              🔒
            </span>

            <span>
              Your data is safe
            </span>

          </div>

          <div>

            <span className="security-icon">
              👥
            </span>

            <span>
              Join our community
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}