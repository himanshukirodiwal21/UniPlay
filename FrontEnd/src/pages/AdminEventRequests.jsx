// src/pages/AdminEventRequests.jsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const AdminEventRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin on mount
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    const user = JSON.parse(currentUser);
    if (user.role !== "admin") {
      alert("Access denied. Admin only area.");
      navigate("/");
      return;
    }

    fetchRequests();
  }, [filter, navigate]);

  // Fetch requests from backend - NO AUTH NEEDED for this endpoint based on your backend
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        filter === "all"
          ? "http://localhost:8000/api/v1/requests"
          : `http://localhost:8000/api/v1/requests?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();
      console.log("Raw response data:", data);

      // Handle different response structures
      let requestsArray = [];
      if (Array.isArray(data)) {
        requestsArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        requestsArray = data.data;
      } else if (data.requests && Array.isArray(data.requests)) {
        requestsArray = data.requests;
      } else {
        console.warn("Unexpected data structure:", data);
        requestsArray = [];
      }

      console.log("Processed requests:", requestsArray);
      setRequests(requestsArray);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError(error.message);
      setRequests([]);
      
      if (error.message.includes("login")) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Approve or reject request
  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this event?`))
      return;

    try {
      const endpoint =
        status === "approved"
          ? `http://localhost:8000/api/v1/requests/${id}/approve`
          : `http://localhost:8000/api/v1/requests/${id}/decline`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          adminNotes,
          reviewedAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to update request");

      alert(`✅ Event ${status} successfully!`);
      setSelectedRequest(null);
      setAdminNotes("");
      fetchRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  // Delete request
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/requests/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete request");

      alert("✅ Request deleted successfully!");
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Error deleting request:", error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "badge-warning",
      approved: "badge-success",
      rejected: "badge-danger",
    };
    return (
      <span className={`badge ${styles[status] || "badge-secondary"}`}>
        {status?.toUpperCase() || "PENDING"}
      </span>
    );
  };

  const RequestCard = ({ request }) => {
    const location = request.location || request.venue || "N/A";
    const fee = request.registrationFee ?? request.fee ?? 0;
    const prize = request.winningPrize || request.prize || "N/A";
    const requestDate = request.requestedAt || request.createdAt;

    return (
      <div className="event-card">
        <div className="card-header">
          <div>
            <h3>{request.name || "Unnamed Event"}</h3>
            <p className="text-muted">
              Requested:{" "}
              {requestDate
                ? new Date(requestDate).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
          {getStatusBadge(request.status)}
        </div>

        <div className="card-body">
          <div className="event-info-grid">
            <div className="info-item">
              <span className="label">📅 Date:</span>
              <span>
                {request.date
                  ? new Date(request.date).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="info-item">
              <span className="label">📍 Venue:</span>
              <span>{location}</span>
            </div>
            <div className="info-item">
              <span className="label">💰 Fee:</span>
              <span>₹{fee}</span>
            </div>
            <div className="info-item">
              <span className="label">🏆 Prize:</span>
              <span>{prize}</span>
            </div>
          </div>

          {request.description && (
            <div className="description-preview">
              <strong>Description:</strong>
              <p>{request.description.substring(0, 100)}...</p>
            </div>
          )}

          <button
            onClick={() => setSelectedRequest(request)}
            className="btn btn-primary btn-block"
          >
            View Details & Take Action
          </button>
        </div>
      </div>
    );
  };

  const DetailModal = () => {
    if (!selectedRequest) return null;

    const location = selectedRequest.location || selectedRequest.venue || "N/A";
    const fee = selectedRequest.registrationFee ?? selectedRequest.fee ?? 0;
    const prize = selectedRequest.winningPrize || selectedRequest.prize || "N/A";
    const image = selectedRequest.image || selectedRequest.thumbnail;

    return (
      <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{selectedRequest.name}</h2>
            <button
              className="close-btn"
              onClick={() => setSelectedRequest(null)}
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Status:</span>
                {getStatusBadge(selectedRequest.status)}
              </div>

              <div className="detail-item">
                <span className="label">📅 Date:</span>
                <span>
                  {selectedRequest.date
                    ? new Date(selectedRequest.date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>

              <div className="detail-item">
                <span className="label">📍 Location:</span>
                <span>{location}</span>
              </div>

              <div className="detail-item">
                <span className="label">🧑‍🤝‍🧑 Eligibility:</span>
                <span>{selectedRequest.eligibility || "N/A"}</span>
              </div>

              <div className="detail-item">
                <span className="label">💰 Registration Fee:</span>
                <span>₹{fee}</span>
              </div>

              <div className="detail-item">
                <span className="label">🏆 Winning Prize:</span>
                <span>{prize}</span>
              </div>

              <div className="detail-item full-width">
                <span className="label">📝 Description:</span>
                <p>{selectedRequest.description || "No description provided"}</p>
              </div>

              {image && (
                <div className="detail-item full-width">
                  <span className="label">🖼️ Thumbnail:</span>
                  <img
                    src={image}
                    alt={selectedRequest.name}
                    style={{
                      maxWidth: "100%",
                      borderRadius: "8px",
                      marginTop: "10px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      console.error("Failed to load image:", image);
                    }}
                  />
                </div>
              )}
            </div>

            {selectedRequest.status === "pending" && (
              <div className="admin-notes-section">
                <label>Admin Notes (Optional):</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  rows="3"
                />
              </div>
            )}

            {selectedRequest.adminNotes && (
              <div className="admin-notes-display">
                <strong>Admin Notes:</strong>
                <p>{selectedRequest.adminNotes}</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            {selectedRequest.status === "pending" ? (
              <>
                <button
                  onClick={() =>
                    handleStatusUpdate(selectedRequest._id, "approved")
                  }
                  className="btn btn-success"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() =>
                    handleStatusUpdate(selectedRequest._id, "rejected")
                  }
                  className="btn btn-danger"
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => handleDelete(selectedRequest._id)}
                  className="btn btn-secondary"
                >
                  🗑️ Delete
                </button>
              </>
            ) : (
              <button
                onClick={() => handleDelete(selectedRequest._id)}
                className="btn btn-danger"
              >
                🗑️ Delete Request
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <main className="container section">
        <h1 className="section-title">🛠️ Admin - Event Requests</h1>

        <div className="filter-bar">
          <button
            onClick={() => setFilter("all")}
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
          >
            All Requests ({requests.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          >
            ⏳ Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`filter-btn ${filter === "approved" ? "active" : ""}`}
          >
            ✅ Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
          >
            ❌ Rejected
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading requests...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>❌ {error}</p>
            <button onClick={fetchRequests} className="btn btn-primary">
              Retry
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p>📭 No event requests found</p>
            <small>Requests will appear here once users submit them</small>
          </div>
        ) : (
          <div className="events-grid">
            {requests.map((request) => (
              <RequestCard key={request._id || request.id} request={request} />
            ))}
          </div>
        )}

        <DetailModal />
      </main>
      <Footer />
    </>
  );
};

export default AdminEventRequests;