import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <nav className="container">
        <Link to="/" className="logo">UniPlay</Link>

        <ul className="nav-links">
          <li><Link to="/">Events</Link></li>
          <li><Link to="/">Leaderboards</Link></li>
          <li><Link to="/">News</Link></li>
          <li><Link to="/about">About Us</Link></li>
        </ul>

        <div className="auth-buttons">
          {/* Pass state to indicate which form to show */}
          <Link to="/login" state={{ form: "login" }} className="btn btn-primary">
            Login
          </Link>
          <Link to="/login" state={{ form: "signup" }} className="btn btn-secondary">
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
