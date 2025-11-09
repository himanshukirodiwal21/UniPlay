// src/pages/UserPanel.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/v1/requests");
        if (!response.ok) throw new Error("Failed to fetch event requests");
        const data = await response.json();

        // Handle both API structures (array or {data: [...]})
        const allRequests = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : data.requests || [];

        setRequests(allRequests);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <>
      <Header />
      <main className="container section">
        <h1>🙋 User Dashboard</h1>
        <h2>All Event Requests</h2>

        {loading ? (
          <p>Loading event requests...</p>
        ) : error ? (
          <p style={{ color: "red" }}>❌ {error}</p>
        ) : requests.length === 0 ? (
          <p>No event requests found. <a href="/request-event">Request one now!</a></p>
        ) : (
          <div className="card-grid">
            {requests.map((req, index) => (
              <div key={req._id || index} className="card">
                <img
                  src={req.image || req.thumbnail || "https://via.placeholder.com/300"}
                  alt={req.name || "Event"}
                />
                <div className="card-content">
                  <h3>{req.name}</h3>
                  <p>📅 {req.date ? new Date(req.date).toLocaleDateString() : "N/A"}</p>
                  <p>📍 {req.location || req.venue || "Unknown"}</p>
                  <p>
                    Status:{" "}
                    {req.status === "pending" && (
                      <span style={{ color: "orange" }}>⏳ Pending</span>
                    )}
                    {req.status === "approved" && (
                      <span style={{ color: "green" }}>✅ Approved</span>
                    )}
                    {req.status === "rejected" && (
                      <span style={{ color: "red" }}>❌ Rejected</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default UserPanel;
