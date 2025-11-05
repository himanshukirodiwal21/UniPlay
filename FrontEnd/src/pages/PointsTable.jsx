// src/pages/PointsTable.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PointsTable = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🧩 STEP 1: Fetch all events on load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // ✅ Fetch events from the correct endpoint
        const res = await fetch("http://localhost:8000/api/v1/events");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response from server (not JSON)");
        }

        const data = await res.json();
        console.log("📊 Fetched Events Response:", data);

        // Handle different response formats
        const allEvents = Array.isArray(data.data) 
          ? data.data 
          : (Array.isArray(data) ? data : []);

        console.log(`✅ Found ${allEvents.length} events`);
        setEvents(allEvents);

        // Auto-select the latest event
        if (allEvents.length > 0) {
          const latest = [...allEvents].sort(
            (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
          )[0];
          console.log("✅ Auto-selected event:", latest.name);
          setSelectedEvent(latest);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching events:", err);
        setError(`Failed to load events: ${err.message}`);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 🧩 STEP 2: Fetch leaderboard whenever selected event changes
  useEffect(() => {
    if (!selectedEvent) {
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`📊 Fetching leaderboard for event: ${selectedEvent.name} (${selectedEvent._id})`);

        // ✅ Try the match routes endpoint first
        const url = `http://localhost:8000/api/v1/matches/events/${selectedEvent._id}/leaderboard`;
        console.log('🔗 Request URL:', url);
        
        const res = await fetch(url);

        console.log('📡 Response status:', res.status);
        console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
          // Try to get error details from response
          const errorText = await res.text();
          console.error('❌ Error response:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || `HTTP error! status: ${res.status}`);
          } catch (parseError) {
            throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
          }
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const responseText = await res.text();
          console.error('❌ Non-JSON response:', responseText);
          throw new Error("Invalid response (not JSON)");
        }

        const data = await res.json();
        console.log("📊 Fetched Leaderboard Response:", data);

        // Handle the response data
        const leaderboardData = data.data || data.leaderboard || [];
        console.log(`✅ Found ${leaderboardData.length} teams in leaderboard`);
        
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error("❌ Error fetching leaderboard:", err);
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Optional: refresh every 30s (changed from 10s to reduce load)
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  return (
    <>
      <Header />
      <main className="container section">
        <h1 className="section-title">🏆 Points Table</h1>

        {/* Event Selector Dropdown */}
        <div style={{ marginBottom: "2rem" }}>
          <label htmlFor="eventSelect" style={{ display: "block", marginBottom: "0.5rem" }}>
            <strong>Select Event:</strong>
          </label>
          <select
            id="eventSelect"
            onChange={(e) => {
              const selected = events.find((ev) => ev._id === e.target.value);
              console.log("🔄 Event changed to:", selected?.name);
              setSelectedEvent(selected);
            }}
            value={selectedEvent?._id || ""}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              minWidth: "250px"
            }}
          >
            <option value="">-- Select Event --</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontSize: "1.2rem" }}>⏳ Loading...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{ 
            padding: "1rem", 
            backgroundColor: "#fee", 
            border: "1px solid #fcc",
            borderRadius: "4px",
            marginBottom: "1rem"
          }}>
            <p style={{ color: "#c00", margin: 0 }}>❌ {error}</p>
          </div>
        )}

        {/* No Event Selected */}
        {!loading && !error && !selectedEvent && events.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontSize: "1.2rem" }}>📭 No events found — please create one first</p>
          </div>
        )}

        {/* No Leaderboard Data */}
        {!loading && !error && selectedEvent && leaderboard.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontSize: "1.2rem" }}>
              📊 No leaderboard data yet for <strong>{selectedEvent.name}</strong>
            </p>
            <p style={{ color: "#666", marginTop: "0.5rem" }}>
              Leaderboard will be populated after matches are completed
            </p>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && !error && selectedEvent && leaderboard.length > 0 && (
          <>
            <h2 style={{ marginBottom: "1rem" }}>
              {selectedEvent.name} - Leaderboard
            </h2>
            <div className="table-container">
              <table className="points-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>Matches</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Draws</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.team?._id || entry._id || index}>
                      <td>
                        <strong>{index + 1}</strong>
                      </td>
                      <td>
                        <strong>{entry.team?.teamName || "Unknown Team"}</strong>
                      </td>
                      <td>{entry.matchesPlayed || 0}</td>
                      <td>{entry.wins || 0}</td>
                      <td>{entry.losses || 0}</td>
                      <td>{entry.draws || 0}</td>
                      <td>
                        <strong>{entry.points || 0}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Last Updated Info */}
            <p style={{ 
              marginTop: "1rem", 
              color: "#666", 
              fontSize: "0.9rem",
              textAlign: "right" 
            }}>
              Auto-refreshes every 30 seconds
            </p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default PointsTable;