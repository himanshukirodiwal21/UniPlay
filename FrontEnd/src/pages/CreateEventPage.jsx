import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CreateEventPage = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState(""); // will store YYYY-MM-DD
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const events = JSON.parse(localStorage.getItem("uniplay_events")) || [];
    const newEvent = { name, date, location, image };

    events.unshift(newEvent);
    localStorage.setItem("uniplay_events", JSON.stringify(events));
    navigate(`/event/0`); // redirect to newly created event
  };

  return (
    <>
      <Header />
      <main className="container section">
        <div className="registration-container">
          <h2 className="section-title">📢 Create a New Event</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Event Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter event name"
                required
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Location / Venue</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                required
              />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Publish Event
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CreateEventPage;
