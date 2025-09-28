import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPanel from "./pages/AdminPanel";
import UserPanel from "./pages/UserPanel";

import EventPage from "./pages/EventPage";

import LoginPage from "./pages/LoginPage";
import RequestEvent from "./pages/RequestEvent";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/user" element={<UserPanel />} />
        <Route path="/request-event" element={<RequestEvent />} />
        <Route path="/create-event" element={<eventPage />} />
        <Route path="/event/:eventId" element={<EventPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
