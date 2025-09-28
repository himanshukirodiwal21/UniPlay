// src/pages/RequestEvent.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const RequestEvent = () => {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    venue: "",
    eligibility: "",
    thumbnail: "",
    prize: "",
    fee: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          date: formData.date,
          location: formData.venue,         // map venue -> location
          eligibility: formData.eligibility,
          image: formData.thumbnail,        // map thumbnail -> image
          registrationFee: formData.fee,    // map fee -> registrationFee
          winningPrize: formData.prize,     // map prize -> winningPrize
          description: formData.description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit event request");
      }

      alert("✅ Your event has been submitted successfully!");
      setFormData({
        name: "",
        date: "",
        venue: "",
        eligibility: "",
        thumbnail: "",
        prize: "",
        fee: "",
        description: "",
      });
    } catch (error) {
      console.error(error);
      alert("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container section">
        <h1 className="section-title">📩 Request a New Event</h1>

        <div className="form-card">
          <form onSubmit={handleSubmit} className="form-grid">
            {/* Event Name */}
            <div className="form-group">
              <label>🏷️ Event Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter event name"
                required
              />
            </div>

            {/* Date */}
            <div className="form-group">
              <label>📅 Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Venue */}
            <div className="form-group">
              <label>📍 Venue:</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Main Ground, Kota"
                required
              />
            </div>

            {/* Eligibility */}
            <div className="form-group">
              <label>🧑‍🤝‍🧑 Eligibility:</label>
              <input
                type="text"
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                placeholder="e.g. Only 1st & 2nd year students"
                required
              />
            </div>

            {/* Thumbnail */}
            <div className="form-group">
              <label>🖼️ Thumbnail (Image URL):</label>
              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="Paste image link"
              />
            </div>

            {/* Prize */}
            <div className="form-group">
              <label>🏆 Winning Prize (optional):</label>
              <input
                type="text"
                name="prize"
                value={formData.prize}
                onChange={handleChange}
                placeholder="e.g. ₹5000 + Trophy"
              />
            </div>

            {/* Registration Fee */}
            <div className="form-group">
              <label>💰 Registration Fee:</label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                placeholder="e.g. 200"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label>📝 Description:</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief details about the event..."
                required
              ></textarea>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RequestEvent;
