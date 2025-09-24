import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const events = JSON.parse(localStorage.getItem("uniplay_events")) || [];
  const event = events[eventId];

  if (!event) {
    return (
      <>
        <Header />
        <main className="container section">
          <h2>Event Not Found</h2>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Go Back Home
          </button>
        </main>
        <Footer />
      </>
    );
  }

  const handleDeleteEvent = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const updatedEvents = [...events];
      updatedEvents.splice(eventId, 1); // remove this event
      localStorage.setItem("uniplay_events", JSON.stringify(updatedEvents));
      navigate("/"); // go back to homepage after deletion
    }
  };

  return (
    <>
      <Header />
      <main className="container section">
        <div className="event-page">
          <h1>{event.name}</h1>
          <img src={event.image} alt={event.name} />
          <p>
            <strong>Date:</strong> {event.date}
          </p>
          <p>
            <strong>Location:</strong> {event.location}
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et
            euismod nulla. Curabitur feugiat, tortor non consequat finibus,
            justo purus auctor massa, nec semper lorem quam in massa.
          </p>
          <div className="event-buttons">
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Back to Home
            </button>
            <button className="btn btn-danger" onClick={handleDeleteEvent}>
              Delete Event
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default EventPage;
