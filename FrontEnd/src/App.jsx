import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminEventRequests from "./pages/AdminEventRequests";
import UserPanel from "./pages/UserPanel";
import LoginPage from "./pages/LoginPage";
import RequestEvent from "./pages/RequestEvent";
import AboutPage from "./pages/AboutPage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EventDetails from "./pages/EventDetails";
import CricketTeamRegistration from "./pages/CricketTeamRegistration";

// make sure import matches usage

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      {/* <Route path="/admin" element={<AdminEventRequests />} /> */}
      <Route path="/user" element={<UserPanel />} />
      <Route path="/request-event" element={<RequestEvent />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/event/:slug-:eventId" element={<EventDetails />} />
      <Route path="/register-team" element={<CricketTeamRegistration />} />


      {/* Protected Admin Route */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminEventRequests />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
