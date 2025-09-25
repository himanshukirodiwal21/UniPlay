import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../assets/style.css"; // your form CSS
import { ToastContainer, toast, Bounce } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


const LoginPage = () => {
  const location = useLocation();

  // Determine which form to show initially
  const initialForm = location.state?.form || "login";
  const [activeForm, setActiveForm] = useState(initialForm);

  const showLogin = () => setActiveForm("login");
  const showSignup = () => setActiveForm("signup");

  const handleSignup = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      const res = await fetch("http://localhost:8000/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, username, password }),
        credentials: "include", // cookies allow karne ke liye
      });

      const data = await res.json();
      console.log("Signup response:", data);

      if (res.ok) {
        toast('User register successfully', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });

        // Optionally redirect to login
        setActiveForm("login");
      } else {
        toast.error(data?.message || "Signup failed", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          transition: Bounce,
        });
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };


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
          <form id="signupForm" onSubmit={handleSignup}>
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

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

    </section>
  );
};

export default LoginPage;
