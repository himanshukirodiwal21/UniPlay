// ForgotPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP verification
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setMessage("✅ OTP sent to your email!");
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.message);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/verify-otp", // Your verify OTP endpoint
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: otp.toString().trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Invalid OTP");

      setMessage("✅ OTP verified successfully!");

      // Redirect to reset password page with email in state
      setTimeout(() => {
        navigate("/reset-password", { state: { email, otp } });
      }, 0);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="password-reset-section">
      <div className="password-reset-container">
        <div className="password-reset-header">
          <h2>{step === 1 ? "Forgot Password?" : "Verify OTP"}</h2>
          <p>
            {step === 1
              ? "Enter your registered email address to receive an OTP."
              : "Enter the verification code sent to your email."}
          </p>
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="password-reset-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-submit">
              Send OTP
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="password-reset-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                className="otp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
              />
            </div>
            <button type="submit" className="btn-submit">
              Verify OTP
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: "0.5rem" }}
              onClick={() => setStep(1)}
            >
              Change Email
            </button>
          </form>
        )}

        {message && <div className="alert-message alert-success">{message}</div>}
        {error && <div className="alert-message alert-error">{error}</div>}
        
        <div className="back-to-login">
          <a href="/login">← Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
