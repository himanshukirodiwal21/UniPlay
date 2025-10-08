// src/pages/EventDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
        <main className="container section">
          <p>Loading event details...</p>
        </main>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <main className="container section">
          <p style={{ color: "red" }}>❌ {error}</p>
        </main>
        <Footer />
      </>
    );

  if (!event)
    return (
      <>
        <Header />
        <main className="container section">
          <p>Event not found.</p>
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
      <main className="container section event-details">
        <h1>{event.name}</h1>
        <p>
          <strong>Date:</strong>{" "}
          {event.date ? new Date(event.date).toLocaleDateString("en-IN") : "N/A"}
        </p>
        <p>
          <strong>Location:</strong> {event.location || "N/A"}
        </p>
        <p>
          <strong>Eligibility:</strong> {event.eligibility || "N/A"}
        </p>

        {event.image && (
          <img
            src={event.image}
            alt={event.name}
            style={{ width: "100%", borderRadius: "10px", margin: "1rem 0" }}
          />
        )}

        <p>
          <strong>Registration Fee:</strong> ₹{event.registrationFee ?? 0}
        </p>
        <p>
          <strong>Winning Prize:</strong> ₹{event.winningPrize ?? 0}
        </p>
        <p>
          <strong>Description:</strong> {event.description || "No description"}
        </p>
        

        {event.status === "approved" ? (
          <button className="btn btn-primary" onClick={handleRegister}>
            🏏 Register Your Team
          </button>
        ) : (
          <button className="btn btn-secondary" disabled>
            Registration Closed
          </button>
        )}

        <div style={{ marginTop: "2rem" }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            ← Back to Events
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default EventDetails;
