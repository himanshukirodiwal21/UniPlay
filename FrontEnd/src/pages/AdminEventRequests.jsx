// src/pages/AdminEventRequests.jsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AdminEventRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  // Fetch requests from backend
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url =
        filter === "all"
          ? "http://localhost:8000/api/v1/requests"
          : `http://localhost:8000/api/v1/requests?status=${filter}`;

      const response = await fetch(url, {
        credentials: "include"
      });
      const data = await response.json();

      console.log("Fetched requests:", data);

      // Adjust according to your backend response
      setRequests(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      alert("Failed to load event requests");
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
        { 
          method: "DELETE",
          credentials: "include" 
         }
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

  const RequestCard = ({ request }) => (
    <div className="event-card">
      <div className="card-header">
        <div>
          <h3>{request.name}</h3>
          <p className="text-muted">
            Requested:{" "}
            {new Date(
              request.requestedAt || request.createdAt
            ).toLocaleDateString()}
          </p>
        </div>
        {getStatusBadge(request.status)}
      </div>

      <div className="card-body">
        <div className="event-info-grid">
          <div className="info-item">
            <span className="label">📅 Date:</span>
            <span>{new Date(request.date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <span className="label">📍 Venue:</span>
            <span>{request.location || request.venue}</span>
          </div>
          <div className="info-item">
            <span className="label">💰 Fee:</span>
            <span>₹{request.registrationFee || request.fee}</span>
          </div>
          <div className="info-item">
            <span className="label">🏆 Prize:</span>
            <span>{request.winningPrize || request.prize || "N/A"}</span>
          </div>
        </div>

        <div className="description-preview">
          <strong>Description:</strong>
          <p>{request.description?.substring(0, 100)}...</p>
        </div>

        <button
          onClick={() => setSelectedRequest(request)}
          className="btn btn-primary btn-block"
        >
          View Details & Take Action
        </button>
      </div>
    </div>
  );

  const DetailModal = () => {
    if (!selectedRequest) return null;

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
                  {new Date(selectedRequest.date).toLocaleDateString()}
                </span>
              </div>

              <div className="detail-item">
                <span className="label">📍 Location:</span>
                <span>{selectedRequest.location || selectedRequest.venue}</span>
              </div>

              <div className="detail-item">
                <span className="label">🧑‍🤝‍🧑 Eligibility:</span>
                <span>{selectedRequest.eligibility}</span>
              </div>

              <div className="detail-item">
                <span className="label">💰 Registration Fee:</span>
                <span>
                  ₹{selectedRequest.registrationFee || selectedRequest.fee}
                </span>
              </div>

              <div className="detail-item">
                <span className="label">🏆 Winning Prize:</span>
                <span>
                  {selectedRequest.winningPrize ||
                    selectedRequest.prize ||
                    "N/A"}
                </span>
              </div>

              <div className="detail-item full-width">
                <span className="label">📝 Description:</span>
                <p>{selectedRequest.description}</p>
              </div>

              {selectedRequest.image && (
                <div className="detail-item full-width">
                  <span className="label">🖼️ Thumbnail:</span>
                  <img
                    src={selectedRequest.image || selectedRequest.thumbnail}
                    alt={selectedRequest.name}
                    style={{
                      maxWidth: "100%",
                      borderRadius: "8px",
                      marginTop: "10px",
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
            All Requests
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
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p>📭 No event requests found</p>
          </div>
        ) : (
          <div className="events-grid">
            {requests.map((request) => (
              <RequestCard key={request._id} request={request} />
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
