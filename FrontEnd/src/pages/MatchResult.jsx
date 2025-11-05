// src/pages/MatchResult.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MatchResult() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch match data
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/matches/${matchId}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch match");
        setMatch(data.data);
      } catch (err) {
        console.error("❌ Error fetching match:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (matchId) fetchMatch();
  }, [matchId]);

  if (loading)
    return (
      <>
        <Header />
        <div style={{ color: "#fff", textAlign: "center", padding: "2rem" }}>
          Loading match data...
        </div>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div style={{ color: "#fff", textAlign: "center", padding: "2rem" }}>
          ❌ {error}
          <br />
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: "1rem",
              background: "#374151",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            ← Go Back
          </button>
        </div>
        <Footer />
      </>
    );

  if (!match)
    return (
      <>
        <Header />
        <div style={{ color: "#fff", textAlign: "center", padding: "2rem" }}>
          No match data found.
        </div>
        <Footer />
      </>
    );

  // ✅ Extract data safely
  const teamAName = match?.teamA?.teamName || "Team A";
  const teamBName = match?.teamB?.teamName || "Team B";
  const winnerName = match?.winner?.teamName || "TBD";
  const status = match?.status || "Scheduled";
  const venue = match?.venue || "Not specified";
  const stage = match?.stage || "N/A";

  // ✅ Directly from backend
  const scoreA = match?.scoreA ?? 0;
  const scoreB = match?.scoreB ?? 0;
  const overs = match?.overs ?? 0;
  const wickets = match?.wickets ?? 0;

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #374151, #6b7280)",
          paddingBottom: "40px",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
          {/* 🏆 Winner / Status Banner */}
          <div
            style={{
              background:
                status === "Completed"
                  ? "linear-gradient(135deg, #16a34a, #22c55e)"
                  : "linear-gradient(135deg, #3b82f6, #60a5fa)",
              padding: "25px",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "25px",
              fontSize: "1.8rem",
              fontWeight: "bold",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            }}
          >
            {status === "Completed"
              ? `🏆 ${winnerName} Won the Match!`
              : status === "InProgress"
              ? `🔥 Match in Progress: ${teamAName} vs ${teamBName}`
              : `📅 Upcoming Match: ${teamAName} vs ${teamBName}`}
          </div>

          {/* 🏟 Venue + Info */}
          <div
            style={{
              background: "#f8f9fa",
              color: "#111",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <p>
              <strong>🏟 Venue:</strong> {venue}
            </p>
            <p>
              <strong>🎯 Stage:</strong> {stage}
            </p>
            <p>
              <strong>📊 Status:</strong> {status}
            </p>
          </div>

          {/* 🏏 Team Scores */}
          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            {/* Team A */}
            <div
              style={{
                background: "#f8f9fa",
                color: "#000",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                borderLeft: "6px solid #3b82f6",
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>{teamAName}</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {scoreA}/{wickets}
              </p>
              <p>Overs: {overs}</p>
            </div>

            {/* Team B */}
            <div
              style={{
                background: "#f8f9fa",
                color: "#000",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                borderLeft: "6px solid #10b981",
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>{teamBName}</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {scoreB}/{wickets}
              </p>
              <p>Overs: {overs}</p>
            </div>
          </div>

          {/* 🔙 Back Button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "block",
              textAlign: "center",
              background: "#374151",
              color: "#fff",
              padding: "12px 18px",
              borderRadius: "8px",
              marginTop: "30px",
              textDecoration: "none",
              fontWeight: "600",
              width: "100%",
              cursor: "pointer",
            }}
          >
            ← Back to Matches
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
