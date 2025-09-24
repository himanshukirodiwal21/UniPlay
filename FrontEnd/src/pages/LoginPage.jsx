import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../assets/style.css"; // your form CSS

const LoginPage = () => {
  const location = useLocation();

  // Determine which form to show initially
  const initialForm = location.state?.form || "login";
  const [activeForm, setActiveForm] = useState(initialForm);

  const showLogin = () => setActiveForm("login");
  const showSignup = () => setActiveForm("signup");

  return (
    <section className="form-section">
      <div className="form-container">
        {/* Toggle Buttons */}
        <div className="form-toggle">
          <button
            className={`toggle-btn ${activeForm === "login" ? "active" : ""}`}
            onClick={showLogin}
          >
            Login
          </button>
          <button
            className={`toggle-btn ${activeForm === "signup" ? "active" : ""}`}
            onClick={showSignup}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {activeForm === "login" && (
          <form id="loginForm">
            <h2>Welcome Back!</h2>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" required />
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </form>
        )}

        {/* Signup Form */}
        {activeForm === "signup" && (
          <form id="signupForm">
            <h2>Create Account</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="fullName" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" required />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" required />
            </div>
            <div className="form-group">
              <label>Create Password</label>
              <input type="password" name="password" required />
            </div>
            <button type="submit" className="btn btn-primary">
              Sign Up
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default LoginPage;
