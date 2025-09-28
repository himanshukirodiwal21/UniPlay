import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserPanel = () => {
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    const allRequests = JSON.parse(localStorage.getItem("event_requests")) || [];
    // For now, just filter by "guestUser"
    const userRequests = allRequests.filter(r => r.userId === "guestUser");
    setMyRequests(userRequests);
  }, []);

  return (
    <>
      <Header />
      <main className="container section">
        <h1>🙋 User Dashboard</h1>
        <h2>My Event Requests</h2>

        {myRequests.length === 0 ? (
          <p>No requests yet. <a href="/request-event">Request one now!</a></p>
        ) : (
          <div className="card-grid">
            {myRequests.map((req, index) => (
              <div key={index} className="card">
                <img src={req.image || "https://via.placeholder.com/300"} alt={req.name} />
                <div className="card-content">
                  <h3>{req.name}</h3>
                  <p>📅 {req.date}</p>
                  <p>📍 {req.location}</p>
                  <p>Status: 
                    {req.status === "pending" && <span style={{color:"orange"}}> ⏳ Pending</span>}
                    {req.status === "approved" && <span style={{color:"green"}}> ✅ Approved</span>}
                    {req.status === "rejected" && <span style={{color:"red"}}> ❌ Rejected</span>}
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
