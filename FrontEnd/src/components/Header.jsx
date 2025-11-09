import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, Settings, Shield } from "lucide-react";
import UniPlayLogo from "../assets/UniPlay.svg";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch current user from localStorage
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

  // Handle scroll to section with smart navigation
  const handleScrollTo = (sectionId) => {
    if (location.pathname === '/') {
      // Already on homepage, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to homepage first, then scroll
      navigate('/');
      // Wait for navigation and DOM update
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setShowDropdown(false);
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

        <ul className="nav-links">
          <li>
            <a 
              onClick={() => handleScrollTo('events')} 
              style={{ cursor: 'pointer' }}
            >
              Events
            </a>
          </li>
          <li>
            <a 
              onClick={() => handleScrollTo('leaderboards')} 
              style={{ cursor: 'pointer' }}
            >
              Leaderboards
            </a>
          </li>
          <li>
            <a 
              onClick={() => handleScrollTo('news')} 
              style={{ cursor: 'pointer' }}
            >
              News
            </a>
          </li>
          <li>
            <Link to="/about">About Us</Link>
          </li>
        </ul>

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
      </nav>
    </header>
  );
}

export default Header;