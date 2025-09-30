import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import UniPlayLogo from "../assets/UniPlay.svg";

function Header() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch current user from backend/localStorage
    const user = localStorage.getItem("currentUser");
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setShowDropdown(false);
    window.location.href = "/login";
  };

  return (
    <header>
      <nav className="container">
        <Link to="/" className="logo">
          <img src={UniPlayLogo} alt="UniPlay Logo" className="logo-img" />
          <span className="logo-text">UniPlay</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/">Events</Link></li>
          <li><Link to="/">Leaderboards</Link></li>
          <li><Link to="/">News</Link></li>
          <li><Link to="/about">About Us</Link></li>
        </ul>

        <div className="auth-buttons">
          {currentUser ? (
            <div className="user-profile-dropdown" ref={dropdownRef}>
              <div
                className="user-icon"
                onClick={() => setShowDropdown(!showDropdown)}
                title={currentUser.fullName}
              >
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>

              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-user-name">{currentUser.fullName}</div>
                    <div className="dropdown-user-email">{currentUser.email}</div>
                  </div>

                  <Link
                    to="/profile"
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
      </nav>
    </header>
  );
}

export default Header;
