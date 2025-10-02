import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get email and OTP from navigation state
  useEffect(() => {
    if (location.state?.email && location.state?.otp) {
      setEmail(location.state.email);
      setOtp(location.state.otp);
    } else {
      // If no state, redirect back to forgot password
      setError("Session expired. Please verify your email again.");
      setTimeout(() => {
        navigate("/forgot-password");
      }, 2000);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long!");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword: password }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setMessage("✅ Password has been reset successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="password-reset-section">
      <div className="password-reset-container">
        <div className="password-reset-header">
          <h2>Create New Password</h2>
          <p>Enter your new password below.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="password-reset-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Reset Password
          </button>
        </form>

        {message && <div className="alert-message alert-success">{message}</div>}
        {error && <div className="alert-message alert-error">{error}</div>}
        
        <div className="back-to-login">
          <a href="/login">← Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;