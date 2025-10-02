// import React, { useState } from "react";
// import { useLocation } from "react-router-dom";
// import "../assets/style.css"; // your form CSS
// import { ToastContainer, toast, Bounce } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';

// const LoginPage = () => {
//   const location = useLocation();

//   // Determine which form to show initially
//   const initialForm = location.state?.form || "login";
//   const [activeForm, setActiveForm] = useState(initialForm);

//   const showLogin = () => setActiveForm("login");
//   const showSignup = () => setActiveForm("signup");

//   const handleSignup = async (e) => {
//     e.preventDefault();

//     const formData = new FormData(e.target);
//     const fullName = formData.get("fullName");
//     const email = formData.get("email");
//     const username = formData.get("username");
//     const password = formData.get("password");

//     try {
//       const res = await fetch("http://localhost:8000/api/v1/users/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ fullName, email, username, password }),
//         credentials: "include", // cookies allow karne ke liye
//       });

//       const data = await res.json();
//       console.log("Signup response:", data);

//       if (res.ok) {
//         toast('User register successfully', {
//           position: "top-right",
//           autoClose: 5000,
//           hideProgressBar: false,
//           closeOnClick: false,
//           pauseOnHover: true,
//           draggable: true,
//           progress: undefined,
//           theme: "light",
//           transition: Bounce,
//         });

//         // Optionally redirect to login
//         setActiveForm("login");
//       } else {
//         toast.error(data?.message || "Signup failed", {
//           position: "top-right",
//           autoClose: 5000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           theme: "light",
//           transition: Bounce,
//         });
//       }

//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong");
//     }
//   };

//   const handleLogin = async (e) => {
//   e.preventDefault(); // form reload ko roke

//   const formData = new FormData(e.target);
//   const email = formData.get("email");
//   const password = formData.get("password");

//   try {
//     const res = await fetch("http://localhost:8000/api/v1/users/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//       credentials: "include",
//     });

//     const data = await res.json();
//     console.log("Login response:", data);

//     if (res.ok) {
//       toast.success("User logged in successfully!", { position: "top-right" });
//       // Optionally redirect after login
//     } else {
//       toast.error(data?.message || "Login failed", { position: "top-right" });
//     }
//   } catch (err) {
//     console.error(err);
//     toast.error("Something went wrong", { position: "top-right" });
//   }
// };

//   return (

//     <section className="form-section">
//       <div className="form-container">
//         {/* Toggle Buttons */}
//         <div className="form-toggle">
//           <button
//             className={`toggle-btn ${activeForm === "login" ? "active" : ""}`}
//             onClick={showLogin}
//           >
//             Login
//           </button>
//           <button
//             className={`toggle-btn ${activeForm === "signup" ? "active" : ""}`}
//             onClick={showSignup}
//           >
//             Sign Up
//           </button>
//         </div>

//         {/* Login Form */}
//         {activeForm === "login" && (
//           <form id="loginForm" onSubmit={handleLogin}>
//             <h2>Welcome Back!</h2>
//             <div className="form-group">
//               <label>Email Address</label>
//               <input type="email" name="email" required />
//             </div>
//             <div className="form-group">
//               <label>Password</label>
//               <input type="password" name="password" required />
//               <a href="#" className="forgot-password">
//                 Forgot Password?
//               </a>
//             </div>
//             <button type="submit" className="btn btn-primary">
//               Login
//             </button>
//           </form>
//         )}

//         {/* Signup Form */}
//         {activeForm === "signup" && (
//           <form id="signupForm" onSubmit={handleSignup}>
//             <h2>Create Account</h2>
//             <div className="form-group">
//               <label>Full Name</label>
//               <input type="text" name="fullName" required />
//             </div>
//             <div className="form-group">
//               <label>Email Address</label>
//               <input type="email" name="email" required />
//             </div>
//             <div className="form-group">
//               <label>Username</label>
//               <input type="text" name="username" required />
//             </div>
//             <div className="form-group">
//               <label>Create Password</label>
//               <input type="password" name="password" required />
//             </div>
//             <button type="submit" className="btn btn-primary">
//               Sign Up
//             </button>
//           </form>
//         )}
//       </div>

//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick={false}
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//         transition={Bounce}
//       />

//     </section>
//   );
// };

// export default LoginPage;

// import { useState } from 'react';
// import { Mail, Lock, User, UserCircle, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react';
// import '../assets/LoginSignup.css';

// export default function AuthPages() {
//   const [currentPage, setCurrentPage] = useState('login');
//   const [isAdminLogin, setIsAdminLogin] = useState(false);
//   const [step, setStep] = useState(1);
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '', otp: '' });
//   const [loginData, setLoginData] = useState({ email: '', password: '' });
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

// const backendUrl = "http://localhost:8000/api/v1/users"; // correct

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const handleLoginChange = (e) => {
//     const { name, value } = e.target;
//     setLoginData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   // Validation
//   const validateStep1 = () => {
//     const newErrors = {};
//     if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
//     if (!formData.username.trim()) newErrors.username = 'Username is required';
//     else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
//     if (!formData.password) newErrors.password = 'Password is required';
//     else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateLogin = () => {
//     const newErrors = {};
//     if (!loginData.email.trim()) newErrors.email = 'Email is required';
//     else if (!/\S+@\S+\.\S+/.test(loginData.email)) newErrors.email = 'Email is invalid';
//     if (!loginData.password) newErrors.password = 'Password is required';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Signup - send OTP
//   const handleSendOTP = async () => {
//     if (!validateStep1()) return;
//     setIsSubmitting(true);
//     try {
//       const res = await fetch(`${backendUrl}/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           fullName: formData.fullName,
//           username: formData.username,
//           email: formData.email,
//           password: formData.password
//         })
//       });
//       const data = await res.json();
//       if (data.success) {
//         setStep(2);
//         alert("OTP sent to " + formData.email);
//       } else {
//         alert(data.message || "Error sending OTP");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Server error");
//     }
//     setIsSubmitting(false);
//   };

//   // Verify OTP
//   const handleVerifyOTP = async () => {
//     if (!formData.otp.trim() || formData.otp.length !== 6) {
//       setErrors({ otp: 'Please enter valid 6-digit OTP' });
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       const res = await fetch(`${backendUrl}/verifyemail`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ code: formData.otp })
//       });
//       const data = await res.json();
//       if (data.success) {
//         setStep(3);
//       } else {
//         alert(data.message || "OTP verification failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Server error");
//     }
//     setIsSubmitting(false);
//   };

//   // Login
//   const handleLogin = async () => {
//     if (!validateLogin()) return;
//     setIsSubmitting(true);
//     try {
//       const res = await fetch(`${backendUrl}/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: loginData.email, password: loginData.password }),
//         credentials: "include"
//       });
//       const data = await res.json();
//       if (data.success) {
//         alert("Login successful! Welcome " + data.data.user.fullName);
//         // optionally save tokens from data.data.accessToken / refreshToken
//       } else {
//         alert(data.message || "Login failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Server error");
//     }
//     setIsSubmitting(false);
//   };

//   const handleKeyPress = (e, action) => { if (e.key === 'Enter') { e.preventDefault(); action(); } };

//   const switchToSignup = () => { setCurrentPage('signup'); setStep(1); setErrors({}); setIsAdminLogin(false); setLoginData({ email: '', password: '' }); };
//   const switchToLogin = () => { setCurrentPage('login'); setStep(1); setErrors({}); setIsAdminLogin(false); setFormData({ fullName: '', username: '', email: '', password: '', otp: '' }); };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         {!isAdminLogin && (
//           <div className="auth-switch">
//             <button className={currentPage === 'login' ? 'active' : ''} onClick={() => setCurrentPage('login')}>Login</button>
//             <button className={currentPage === 'signup' ? 'active' : ''} onClick={switchToSignup}>Sign Up</button>
//           </div>
//         )}

//         {currentPage === 'login' && (
//           <div className="auth-form">
//             <h1>{isAdminLogin ? 'Admin Login' : 'Welcome Back'}</h1>
//             <div className="input-group">
//               <label>Email</label>
//               <div className="input-icon">
//                 <Mail />
//                 <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} onKeyPress={(e) => handleKeyPress(e, handleLogin)} placeholder="Your email" />
//               </div>
//               {errors.email && <p className="error">{errors.email}</p>}
//             </div>

//             <div className="input-group">
//               <label>Password</label>
//               <div className="input-icon">
//                 <Lock />
//                 <input type={showPassword ? 'text' : 'password'} name="password" value={loginData.password} onChange={handleLoginChange} onKeyPress={(e) => handleKeyPress(e, handleLogin)} placeholder="Your password" />
//                 <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button>
//               </div>
//               {errors.password && <p className="error">{errors.password}</p>}
//             </div>

//             <button onClick={handleLogin} disabled={isSubmitting}>{isSubmitting ? 'Logging...' : 'Login'}</button>
//           </div>
//         )}

//         {currentPage === 'signup' && step === 1 && (
//           <div className="auth-form">
//             <h1>Create Account</h1>
//             <div className="input-group">
//               <label>Full Name</label>
//               <div className="input-icon">
//                 <UserCircle />
//                 <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} onKeyPress={(e) => handleKeyPress(e, handleSendOTP)} placeholder="Full Name" />
//               </div>
//               {errors.fullName && <p className="error">{errors.fullName}</p>}
//             </div>
//             <div className="input-group">
//               <label>Username</label>
//               <div className="input-icon">
//                 <User />
//                 <input type="text" name="username" value={formData.username} onChange={handleChange} onKeyPress={(e) => handleKeyPress(e, handleSendOTP)} placeholder="Username" />
//               </div>
//               {errors.username && <p className="error">{errors.username}</p>}
//             </div>
//             <div className="input-group">
//               <label>Email</label>
//               <div className="input-icon">
//                 <Mail />
//                 <input type="email" name="email" value={formData.email} onChange={handleChange} onKeyPress={(e) => handleKeyPress(e, handleSendOTP)} placeholder="Email" />
//               </div>
//               {errors.email && <p className="error">{errors.email}</p>}
//             </div>
//             <div className="input-group">
//               <label>Password</label>
//               <div className="input-icon">
//                 <Lock />
//                 <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} onKeyPress={(e) => handleKeyPress(e, handleSendOTP)} placeholder="Password" />
//                 <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button>
//               </div>
//               {errors.password && <p className="error">{errors.password}</p>}
//             </div>
//             <button onClick={handleSendOTP} disabled={isSubmitting}>{isSubmitting ? 'Sending OTP...' : 'Send OTP'}</button>
//           </div>
//         )}

//         {currentPage === 'signup' && step === 2 && (
//           <div className="auth-form">
//             <label>Enter OTP</label>
//             <input type="text" name="otp" value={formData.otp} onChange={handleChange} onKeyPress={(e) => handleKeyPress(e, handleVerifyOTP)} maxLength="6" placeholder="000000" />
//             {errors.otp && <p className="error">{errors.otp}</p>}
//             <button onClick={handleVerifyOTP} disabled={isSubmitting}>{isSubmitting ? 'Verifying...' : 'Verify OTP'}</button>
//             <button onClick={() => setStep(1)}>← Back</button>
//           </div>
//         )}

//         {currentPage === 'signup' && step === 3 && (
//           <div className="success-msg">
//             <CheckCircle />
//             <h2>Account Created!</h2>
//             <p>Your account has been successfully created</p>
//             <div className="account-details">
//               <p>Name: {formData.fullName}</p>
//               <p>Username: @{formData.username}</p>
//               <p>Email: {formData.email}</p>
//             </div>
//             <button onClick={switchToLogin}>Go to Login</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/pages/LoginPage.jsx (ya AuthPages.jsx)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  UserCircle,
  User,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

export default function AuthPages() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("login");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    otp: "",
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [adminLoginData, setAdminLoginData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.role === "admin") {
        navigate("/", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAdminLoginChange = (e) => {
    const { name, value } = e.target;
    setAdminLoginData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3)
      newErrors.username = "Username must be at least 3 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginData.email))
      newErrors.email = "Email is invalid";
    if (!loginData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAdminLogin = () => {
    const newErrors = {};
    if (!adminLoginData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(adminLoginData.email))
      newErrors.email = "Email is invalid";
    if (!adminLoginData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        const userData = {
          id: data.data.user._id || data.data.user.id,
          fullName: data.data.user.fullName,
          username: data.data.user.username,
          email: data.data.user.email,
          role: "user",
        };
        localStorage.setItem("currentUser", JSON.stringify(userData));
        alert("Login successful: " + loginData.email);
        navigate("/", { replace: true });
      } else if (res.status === 403 && data.needsVerification) {
        setFormData({
          fullName: data.user.fullName,
          username: data.user.username,
          email: data.user.email,
          password: loginData.password,
          otp: "",
        });
        setLoginData({ email: "", password: "" });
        setErrors({});
        setCurrentPage("signup");
        setStep(2);
        alert(data.message);
      } else {
        alert(data?.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Invalid Detail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!validateAdminLogin()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminLoginData),
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        const adminData = {
          id: data.data.admin._id || data.data.admin.id,
          fullName: data.data.admin.fullName,
          email: data.data.admin.email,
          role: "admin",
        };
        localStorage.setItem("currentUser", JSON.stringify(adminData));
        alert("Admin login successful: " + adminLoginData.email);
        navigate("/", { replace: true });
      } else {
        alert(data?.message || "Admin login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOTP = async () => {
    if (!validateStep1()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok || res.status === 200) {
        setStep(2);
        setFormData((prev) => ({ ...prev, otp: "" }));
        alert(data?.message || "OTP sent to " + formData.email);
      } else if (res.status === 409) {
        alert(data?.message || "User already exists. Please login.");
      } else {
        alert(data?.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp.trim()) {
      setErrors({ otp: "Please enter OTP" });
      return;
    }
    if (formData.otp.length !== 6) {
      setErrors({ otp: "OTP must be 6 digits" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/users/verifyemail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: formData.otp }),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        setErrors({ otp: data?.message || "OTP verification failed" });
      }
    } catch (err) {
      console.error(err);
      setErrors({ otp: "Something went wrong" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({ ...prev, otp: "" }));
        alert(data?.message || "OTP resent to " + formData.email);
      } else {
        alert(data?.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to resend OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToSignup = () => {
    setCurrentPage("signup");
    setStep(1);
    setErrors({});
    setLoginData({ email: "", password: "" });
  };

  const switchToLogin = () => {
    setCurrentPage("login");
    setStep(1);
    setErrors({});
    setFormData({
      fullName: "",
      username: "",
      email: "",
      password: "",
      otp: "",
    });
  };

  const switchToAdminLogin = () => {
    setCurrentPage("adminLogin");
    setErrors({});
    setAdminLoginData({ email: "", password: "" });
  };

  const switchBackToUserLogin = () => {
    setCurrentPage("login");
    setErrors({});
    setAdminLoginData({ email: "", password: "" });
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg,#ebf8ff,#e0e7ff)",
      padding: "16px",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "400px",
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      padding: "32px",
    },
    tabContainer: {
      display: "flex",
      gap: "8px",
      marginBottom: "32px",
    },
    tab: (active) => ({
      flex: 1,
      padding: "8px",
      borderRadius: "8px",
      fontWeight: "500",
      border: "none",
      background: active ? "#fff" : "transparent",
      color: active ? "#4f46e5" : "#374151",
      cursor: "pointer",
    }),
    inputGroup: { marginBottom: "16px", position: "relative" },
    label: {
      display: "block",
      marginBottom: "4px",
      color: "#374151",
      fontSize: "14px",
      fontWeight: "500",
    },
    input: (hasIcon) => ({
      width: "100%",
      padding: hasIcon ? "12px 12px 12px 40px" : "12px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      outline: "none",
      fontSize: "14px",
      boxSizing: "border-box",
    }),
    icon: {
      position: "absolute",
      left: "12px",
      top: "38px",
      color: "#9ca3af",
      width: "18px",
      height: "18px",
    },
    passwordToggle: {
      position: "absolute",
      right: "12px",
      top: "38px",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#6b7280",
      padding: "0",
    },
    button: (bgColor, disabled) => ({
      width: "100%",
      padding: "12px",
      background: disabled ? "#d1d5db" : bgColor || "#4f46e5",
      color: "#fff",
      fontWeight: "600",
      borderRadius: "8px",
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      marginTop: "12px",
      opacity: disabled ? 0.6 : 1,
    }),
    adminButton: {
      width: "100%",
      padding: "12px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
      fontWeight: "600",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      marginTop: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    backButton: {
      width: "100%",
      padding: "12px",
      background: "transparent",
      color: "#4f46e5",
      fontWeight: "600",
      borderRadius: "8px",
      border: "2px solid #4f46e5",
      cursor: "pointer",
      marginTop: "12px",
    },
    error: { color: "#ef4444", fontSize: "0.75rem", marginTop: "4px" },
    stepContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "24px",
    },
    stepCircle: (active) => ({
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      background: active ? "#4f46e5" : "#d1d5db",
      color: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "600",
      fontSize: "14px",
    }),
    stepLine: (active) => ({
      width: "40px",
      height: "4px",
      background: active ? "#4f46e5" : "#d1d5db",
    }),
    centerText: { textAlign: "center" },
    successBox: {
      background: "#f0fdf4",
      padding: "16px",
      borderRadius: "8px",
      marginBottom: "16px",
      border: "1px solid #bbf7d0",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      margin: "20px 0",
      color: "#9ca3af",
      fontSize: "14px",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      background: "#e5e7eb",
    },
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") action();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {currentPage !== "adminLogin" && (
          <div style={styles.tabContainer}>
            <button
              style={styles.tab(currentPage === "login")}
              onClick={switchToLogin}
            >
              Login
            </button>
            <button
              style={styles.tab(currentPage === "signup")}
              onClick={switchToSignup}
            >
              Sign Up
            </button>
          </div>
        )}

        {currentPage === "adminLogin" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  margin: "0 auto 16px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={32} color="#fff" />
              </div>
              <h2 style={{ color: "#1f2937", margin: "0 0 8px 0" }}>
                Admin Login
              </h2>
              <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
                Access admin dashboard
              </p>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Admin Email</label>
              <Mail style={styles.icon} />
              <input
                type="email"
                name="email"
                value={adminLoginData.email}
                onChange={handleAdminLoginChange}
                onKeyPress={(e) => handleKeyPress(e, handleAdminLogin)}
                style={styles.input(true)}
                placeholder="Enter admin email"
              />
              {errors.email && <div style={styles.error}>{errors.email}</div>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Admin Password</label>
              <Lock style={styles.icon} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={adminLoginData.password}
                onChange={handleAdminLoginChange}
                onKeyPress={(e) => handleKeyPress(e, handleAdminLogin)}
                style={styles.input(true)}
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && (
                <div style={styles.error}>{errors.password}</div>
              )}
            </div>

            <button
              onClick={handleAdminLogin}
              disabled={isSubmitting}
              style={styles.button("#764ba2", isSubmitting)}
            >
              {isSubmitting ? "Logging in..." : "Login as Admin"}
            </button>

            <button onClick={switchBackToUserLogin} style={styles.backButton}>
              ← Back to User Login
            </button>
          </div>
        )}

        {currentPage === "login" && (
          <div>
            <h2
              style={{
                ...styles.centerText,
                marginBottom: "16px",
                color: "#1f2937",
              }}
            >
              Welcome Back
            </h2>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <Mail style={styles.icon} />
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                style={styles.input(true)}
                placeholder="Enter email"
              />
              {errors.email && <div style={styles.error}>{errors.email}</div>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <Lock style={styles.icon} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                style={styles.input(true)}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && (
                <div style={styles.error}>{errors.password}</div>
              )}
            </div>
            <p style={{ textAlign: "right", marginTop: "0.5rem" }}>
              <a href="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </a>
            </p>

            <button
              onClick={handleLogin}
              disabled={isSubmitting}
              style={styles.button("#4f46e5", isSubmitting)}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={{ padding: "0 12px" }}>or</span>
              <div style={styles.dividerLine}></div>
            </div>

            <button onClick={switchToAdminLogin} style={styles.adminButton}>
              <Shield size={20} />
              Login as Admin
            </button>
          </div>
        )}

        {currentPage === "signup" && (
          <div>
            <div style={styles.stepContainer}>
              <div style={styles.stepCircle(step >= 1)}>1</div>
              <div style={styles.stepLine(step >= 2)}></div>
              <div style={styles.stepCircle(step >= 2)}>2</div>
              <div style={styles.stepLine(step >= 3)}></div>
              <div style={styles.stepCircle(step >= 3)}>3</div>
            </div>

            {step === 1 && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <UserCircle style={styles.icon} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, handleSendOTP)}
                    style={styles.input(true)}
                    placeholder="Enter full name"
                  />
                  {errors.fullName && (
                    <div style={styles.error}>{errors.fullName}</div>
                  )}
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Username</label>
                  <User style={styles.icon} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, handleSendOTP)}
                    style={styles.input(true)}
                    placeholder="Choose username"
                  />
                  {errors.username && (
                    <div style={styles.error}>{errors.username}</div>
                  )}
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email</label>
                  <Mail style={styles.icon} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, handleSendOTP)}
                    style={styles.input(true)}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <div style={styles.error}>{errors.email}</div>
                  )}
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <Lock style={styles.icon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyPress={(e) => handleKeyPress(e, handleSendOTP)}
                    style={styles.input(true)}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && (
                    <div style={styles.error}>{errors.password}</div>
                  )}
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={isSubmitting}
                  style={styles.button("#4f46e5", isSubmitting)}
                >
                  {isSubmitting ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ ...styles.centerText, marginBottom: "16px" }}>
                  <p style={{ color: "#6b7280", fontSize: "14px" }}>
                    OTP sent to <strong>{formData.email}</strong>
                  </p>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Enter OTP</label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength="6"
                    onKeyPress={(e) => handleKeyPress(e, handleVerifyOTP)}
                    style={{
                      ...styles.input(false),
                      textAlign: "center",
                      fontSize: "20px",
                      letterSpacing: "8px",
                    }}
                    placeholder="000000"
                  />
                  {errors.otp && <div style={styles.error}>{errors.otp}</div>}
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={isSubmitting}
                  style={styles.button("#4f46e5", isSubmitting)}
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  onClick={handleResendOTP}
                  disabled={isSubmitting}
                  style={{
                    ...styles.button("transparent", isSubmitting),
                    color: "#4f46e5",
                    marginTop: "8px",
                  }}
                >
                  {isSubmitting ? "Resending..." : "Resend OTP"}
                </button>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    ...styles.button("transparent"),
                    color: "#374151",
                    marginTop: "8px",
                  }}
                >
                  ← Back to edit details
                </button>
              </>
            )}

            {step === 3 && (
              <div style={styles.centerText}>
                <CheckCircle
                  size={64}
                  style={{
                    color: "#16a34a",
                    marginBottom: "16px",
                    display: "inline-block",
                  }}
                />
                <h2 style={{ color: "#1f2937", marginBottom: "16px" }}>
                  Account Created!
                </h2>
                <div style={styles.successBox}>
                  <p style={{ margin: "8px 0", color: "#166534" }}>
                    <strong>Name:</strong> {formData.fullName}
                  </p>
                  <p style={{ margin: "8px 0", color: "#166534" }}>
                    <strong>Username:</strong> {formData.username}
                  </p>
                  <p style={{ margin: "8px 0", color: "#166534" }}>
                    <strong>Email:</strong> {formData.email}
                  </p>
                </div>
                <button
                  onClick={switchToLogin}
                  style={styles.button("#4f46e5")}
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
