import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  // =====================================================
  // MOBILE MENU STATE
  // =====================================================

  const [menuOpen, setMenuOpen] = useState(false);

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    closeMenu();

    logout();

    navigate("/feed", {
      replace: true,
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/feed"
          className="navbar-logo"
          onClick={closeMenu}
        >
          Rhombix
          <span>Social</span>
        </Link>

        {/* =================================================
            DESKTOP LINKS
        ================================================= */}

        <div className="navbar-links">

          <Link to="/feed">
            Home
          </Link>

          {user ? (
            <>
              <Link to="/profile">
                Profile
              </Link>

              <span className="navbar-user">
                Hi, {user.name}
              </span>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-register-btn"
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* =================================================
            MOBILE BURGER BUTTON
        ================================================= */}

        <button
          type="button"
          className={`mobile-menu-btn ${
            menuOpen ? "active" : ""
          }`}
          onClick={() =>
            setMenuOpen((previous) => !previous)
          }
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>

      {/* =================================================
          MOBILE MENU
      ================================================= */}

      <div
        className={`mobile-menu ${
          menuOpen ? "mobile-menu-open" : ""
        }`}
      >

        {/* =================================================
            MOBILE HOME
        ================================================= */}

        <Link
          to="/feed"
          className="mobile-menu-link"
          onClick={closeMenu}
        >
          <span className="mobile-menu-icon">
            🏠
          </span>

          <span>
            Home
          </span>
        </Link>

        {user ? (
          <>
            {/* =================================================
                MOBILE PROFILE
            ================================================= */}

            <Link
              to="/profile"
              className="mobile-menu-link"
              onClick={closeMenu}
            >
              <span className="mobile-menu-icon">
                👤
              </span>

              <span>
                Profile
              </span>
            </Link>

            {/* =================================================
                MOBILE USER
            ================================================= */}

            <div className="mobile-menu-user">
              <span className="mobile-menu-icon">
                👋
              </span>

              <span>
                Hi, {user.name}
              </span>
            </div>

            {/* =================================================
                MOBILE LOGOUT
            ================================================= */}

            <button
              type="button"
              className="mobile-logout-btn"
              onClick={handleLogout}
            >
              <span className="mobile-menu-icon">
                🚪
              </span>

              <span>
                Logout
              </span>
            </button>
          </>
        ) : (
          <>
            {/* =================================================
                MOBILE LOGIN
            ================================================= */}

            <Link
              to="/login"
              className="mobile-menu-link"
              onClick={closeMenu}
            >
              <span className="mobile-menu-icon">
                🔐
              </span>

              <span>
                Login
              </span>
            </Link>

            {/* =================================================
                MOBILE REGISTER
            ================================================= */}

            <Link
              to="/register"
              className="mobile-menu-link mobile-register-link"
              onClick={closeMenu}
            >
              <span className="mobile-menu-icon">
                ✨
              </span>

              <span>
                Create Account
              </span>
            </Link>
          </>
        )}

      </div>
    </nav>
  );
}