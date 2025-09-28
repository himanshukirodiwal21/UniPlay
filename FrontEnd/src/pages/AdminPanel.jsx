import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AdminPanel = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const savedRequests = JSON.parse(localStorage.getItem("event_requests")) || [];
    setRequests(savedRequests);
  }, []);

  const updateRequests = (updated) => {
    localStorage.setItem("event_requests", JSON.stringify(updated));
    setRequests(updated);
  };

  const handleApprove = (index) => {
    const updated = [...requests];
    updated[index].status = "approved";

    // Save to main events list
    const events = JSON.parse(localStorage.getItem("uniplay_events")) || [];
    events.push(updated[index]);
    localStorage.setItem("uniplay_events", JSON.stringify(events));

    updateRequests(updated);
  };

  const handleReject = (index) => {
    const updated = [...requests];
    updated[index].status = "rejected";
    updateRequests(updated);
  };

  return (
    <>
      <Header />
      <main className="container section">
        <h1>👨‍💻 Admin Panel</h1>
        <h2>Pending Event Requests</h2>

        {requests.filter(r => r.status === "pending").length === 0 ? (
          <p>No pending requests 🎉</p>
        ) : (
          <div className="card-grid">
            {requests
              .filter((r) => r.status === "pending")
              .map((req, index) => (
                <div key={index} className="card">
                  <img src={req.image || "https://via.placeholder.com/300"} alt={req.name} />
                  <div className="card-content">
                    <h3>{req.name}</h3>
                    <p>📅 {req.date}</p>
                    <p>📍 {req.location}</p>
                    <button onClick={() => handleApprove(index)} className="btn btn-primary">Approve ✅</button>
                    <button onClick={() => handleReject(index)} className="btn btn-secondary">Reject ❌</button>
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

export default AdminPanel;
