// src/pages/EventDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/EventDetails.css";

const EventDetails = () => {
  // URL: /event/:slug-:eventId
  const { eventId } = useParams(); // get ID from URL
  const location = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(!event);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (event) return; // already have event from state

    if (!eventId) {
      setError("No event ID provided in URL");
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/api/events/${eventId}`);
        if (!res.ok) throw new Error("Failed to fetch event details");
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [event, eventId]);

  if (loading)
    return (
      <>
        <Header />
        <main className="event-details-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading event details...</p>
          </div>
        </main>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <main className="event-details-container">
          <div className="error-state">
            <span className="error-icon">❌</span>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </div>
        </main>
        <Footer />
      </>
    );

  if (!event)
    return (
      <>
        <Header />
        <main className="event-details-container">
          <div className="error-state">
            <p>Event not found.</p>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </div>
        </main>
        <Footer />
      </>
    );

  const handleRegister = () => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      alert("Please login to register your team.");
      navigate("/login");
      return;
    }
    navigate("/register-team", { state: { event } });
  };

  return (
    <>
      <Header />
      <main className="event-details-container">
        <div className="event-details-content">
          {/* Hero Section with Image */}
          {event.image && (
            <div className="event-hero">
              <img src={event.image} alt={event.name} className="event-hero-image" />
              <div className="event-hero-overlay">
                <h1 className="event-title">{event.name}</h1>
              </div>
            </div>
          )}

          {/* Event Info Grid */}
          <div className="event-info-section">
            {!event.image && <h1 className="event-title-standalone">{event.name}</h1>}
            
            <div className="event-meta-grid">
              <div className="meta-card">
                <span className="meta-icon">📅</span>
                <div className="meta-content">
                  <span className="meta-label">Date</span>
                  <span className="meta-value">
                    {event.date ? new Date(event.date).toLocaleDateString("en-IN", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "N/A"}
                  </span>
                </div>
              </div>

              <div className="meta-card">
                <span className="meta-icon">📍</span>
                <div className="meta-content">
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{event.location || "N/A"}</span>
                </div>
              </div>

              <div className="meta-card">
                <span className="meta-icon">✅</span>
                <div className="meta-content">
                  <span className="meta-label">Eligibility</span>
                  <span className="meta-value">{event.eligibility || "N/A"}</span>
                </div>
              </div>

              <div className="meta-card highlight">
                <span className="meta-icon">💰</span>
                <div className="meta-content">
                  <span className="meta-label">Registration Fee</span>
                  <span className="meta-value">₹{event.registrationFee ?? 0}</span>
                </div>
              </div>

              <div className="meta-card highlight prize-card">
                <span className="meta-icon">🏆</span>
                <div className="meta-content">
                  <span className="meta-label">Winning Prize</span>
                  <span className="meta-value prize-amount">₹{event.winningPrize ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="event-description-section">
              <h2 className="section-title">About This Event</h2>
              <p className="event-description">
                {event.description || "No description available"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="event-actions">
              {event.status === "approved" ? (
                <button className="btn btn-primary btn-register" onClick={handleRegister}>
                  <span className="btn-icon">🏏</span>
                  Register Your Team
                </button>
              ) : (
                <button className="btn btn-secondary btn-closed" disabled>
                  <span className="btn-icon">🔒</span>
                  Registration Closed
                </button>
              )}

              <button className="btn btn-outline" onClick={() => navigate(-1)}>
                <span className="btn-icon">←</span>
                Back to Events
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default EventDetails;