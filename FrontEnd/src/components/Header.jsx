import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  LogOut,
  Settings,
  Shield,
  Menu, // Import Menu icon for hamburger
  X, // Import X icon for close button
} from "lucide-react";
import UniPlayLogo from "../assets/UniPlay.svg";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null); // Ref for mobile menu

  useEffect(() => {
    // This effect to set padding is great!
    const header = document.querySelector("header");
    const main = document.querySelector("main");
    if (header && main) {
      main.style.paddingTop = `${header.offsetHeight}px`;
    }
  }, []);

  useEffect(() => {
    // Fetch current user from localStorage
    const user = localStorage.getItem("currentUser");
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  useEffect(() => {
    // Click outside handler for both dropdown and mobile menu
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-nav-toggle") // Don't close if clicking the toggle
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll to section with smart navigation
  const handleScrollTo = (sectionId) => {
    if (location.pathname === "/") {
      // Already on homepage, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Navigate to homepage first, then scroll
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300); // Wait for navigation
    }
  };

  // New handler for mobile links to also close the menu
  const handleMobileLinkClick = (sectionId) => {
    if (sectionId) {
      handleScrollTo(sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setShowDropdown(false);
    setIsMobileMenuOpen(false); // Close mobile menu on logout
    navigate("/", { replace: true });
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <header>
      <nav className="container">
        <Link to="/" className="logo">
          <img src={UniPlayLogo} alt="UniPlay Logo" className="logo-img" />
          <span className="logo-text">UniPlay</span>
        </Link>

        {/* --- Desktop Navigation --- */}
        <ul className="nav-links">
          <li>
            {/* These 'onClick' handlers now work with the IDs in HomePage.jsx */}
            <a onClick={() => handleScrollTo("live")} style={{ cursor: "pointer" }}>
              Live
            </a>
          </li>
          <li>
            <a onClick={() => handleScrollTo("events")} style={{ cursor: "pointer" }}>
              Events
            </a>
          </li>
          <li>
            <a
              onClick={() => handleScrollTo("leaderboards")}
              style={{ cursor: "pointer" }}
            >
              Leaderboards
            </a>
          </li>
          <li>
            <Link to="/news">News</Link>
          </li>
          <li>
            <Link to="/about">About Us</Link>
          </li>
        </ul>

        {/* --- Desktop Auth Buttons --- */}
        <div className="auth-buttons">
          {currentUser ? (
            <div className="user-profile-dropdown" ref={dropdownRef}>
              <div
                className="user-icon"
                onClick={() => setShowDropdown(!showDropdown)}
                title={currentUser.fullName}
                style={
                  isAdmin
                    ? {
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }
                    : {}
                }
              >
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>

              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-user-name">
                      {currentUser.fullName}
                      {isAdmin && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "12px",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Shield size={12} /> Admin
                        </span>
                      )}
                    </div>
                    <div className="dropdown-user-email">
                      {currentUser.email}
                    </div>
                  </div>

                  {isAdmin ? (
                    <>
                      <Link
                        to="/admin"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Shield size={18} /> <span>Admin Dashboard</span>
                      </Link>

                      <Link
                        to="/admin/settings"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings size={18} /> <span>Admin Settings</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/user"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User size={18} /> <span>My Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings size={18} /> <span>Settings</span>
                      </Link>
                    </>
                  )}

                  <button onClick={handleLogout} className="dropdown-item">
                    <LogOut size={18} /> <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                state={{ form: "login" }}
                className="btn btn-primary"
              >
                Login
              </Link>
              <Link
                to="/login"
                state={{ form: "signup" }}
                className="btn btn-secondary"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* --- Mobile Navigation Toggle --- */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* --- Mobile Navigation Sidebar --- */}
      <div
        className={`mobile-nav-sidebar ${isMobileMenuOpen ? "open" : ""}`}
        ref={mobileMenuRef}
      >
        <div className="mobile-nav-header">
          <span className="logo-text">UniPlay Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="close-btn"
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
        </div>
        <ul className="mobile-nav-links">
          <li>
            <a onClick={() => handleMobileLinkClick("live")}>Live</a>
          </li>
          <li>
            <a onClick={() => handleMobileLinkClick("events")}>Events</a>
          </li>
          <li>
            <a onClick={() => handleMobileLinkClick("leaderboards")}>
              Leaderboards
            </a>
          </li>
          <li>
            <a onClick={() => handleMobileLinkClick("news")}>News</a>
          </li>
          <li>
            <Link to="/about" onClick={() => handleMobileLinkClick()}>
              About Us
            </Link>
          </li>
        </ul>

        <div className="mobile-auth-buttons">
          {currentUser ? (
            <>
              <div className="mobile-user-info">
                <div
                  className="user-icon"
                  style={
                    isAdmin
                      ? {
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }
                      : {}
                  }
                >
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{currentUser.fullName}</strong>
                  <small>{currentUser.email}</small>
                </div>
              </div>
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className="btn btn-primary"
                    onClick={() => handleMobileLinkClick()}
                  >
                    <Shield size={18} /> Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="btn btn-secondary"
                    onClick={() => handleMobileLinkClick()}
                  >
                    <Settings size={18} /> Admin Settings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/user"
                    className="btn btn-primary"
                    onClick={() => handleMobileLinkClick()}
                  >
                    <User size={18} /> My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="btn btn-secondary"
                    onClick={() => handleMobileLinkClick()}
                  >
                    <Settings size={18} /> Settings
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-logout">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                state={{ form: "login" }}
                className="btn btn-primary"
                onClick={() => handleMobileLinkClick()}
              >
                Login
              </Link>
              <Link
                to="/login"
                state={{ form: "signup" }}
                className="btn btn-secondary"
                onClick={() => handleMobileLinkClick()}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Overlay for when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}

export default Header;