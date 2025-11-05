// src/pages/MatchResult.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const BACKEND_URL = 'http://localhost:8000';

export default function MatchResult() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch match data with live scores
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/matches/${matchId}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch match");
        
        let matchData = data.data;

        // ✅ Fetch live data to get accurate scores (for InProgress and Completed matches)
        if (matchData.status === "InProgress" || matchData.status === "Completed") {
          try {
            const liveResponse = await fetch(`${BACKEND_URL}/api/v1/live-matches/${matchId}`);
            const liveData = await liveResponse.json();
            
            if (liveData.success && liveData.data.innings) {
              const innings = liveData.data.innings;
              
              // Get team scores from innings data
              const getTeamScore = (teamId) => {
                // Check current innings
                const currentInnings = innings[liveData.data.currentInnings - 1];
                if (currentInnings?.battingTeam?._id?.toString() === teamId?.toString()) {
                  return {
                    score: currentInnings.score || 0,
                    wickets: currentInnings.wickets || 0,
                    overs: currentInnings.overs || 0,
                  };
                }
                
                // Check first innings
                if (innings[0]?.battingTeam?._id?.toString() === teamId?.toString()) {
                  return {
                    score: innings[0].score || 0,
                    wickets: innings[0].wickets || 0,
                    overs: innings[0].overs || 0,
                  };
                }
                
                // Check second innings
                if (innings[1]?.battingTeam?._id?.toString() === teamId?.toString()) {
                  return {
                    score: innings[1].score || 0,
                    wickets: innings[1].wickets || 0,
                    overs: innings[1].overs || 0,
                  };
                }
                
                return { score: 0, wickets: 0, overs: 0 };
              };

              const teamAScore = getTeamScore(matchData.teamA?._id);
              const teamBScore = getTeamScore(matchData.teamB?._id);

              matchData = {
                ...matchData,
                scoreA: teamAScore.score,
                wicketsA: teamAScore.wickets,
                oversA: teamAScore.overs,
                scoreB: teamBScore.score,
                wicketsB: teamBScore.wickets,
                oversB: teamBScore.overs,
              };
            }
          } catch (liveErr) {
            console.error("Error fetching live data:", liveErr);
            // Continue with basic match data
          }
        }

        setMatch(matchData);
      } catch (err) {
        console.error("❌ Error fetching match:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchMatch();
      
      // Auto-refresh for InProgress matches
      const interval = setInterval(() => {
        if (match?.status === "InProgress") {
          fetchMatch();
        }
      }, 5000); // Refresh every 5 seconds for live matches

      return () => clearInterval(interval);
    }
  }, [matchId, match?.status]);

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

  // ✅ Extract data safely with live scores
  const teamAName = match?.teamA?.teamName || "Team A";
  const teamBName = match?.teamB?.teamName || "Team B";
  const winnerName = match?.winner?.teamName || "TBD";
  const status = match?.status || "Scheduled";
  const venue = match?.venue || "Not specified";
  const stage = match?.stage || "N/A";

  // ✅ Use live scores
  const scoreA = match?.scoreA ?? 0;
  const wicketsA = match?.wicketsA ?? 0;
  const oversA = match?.oversA ?? 0;
  
  const scoreB = match?.scoreB ?? 0;
  const wicketsB = match?.wicketsB ?? 0;
  const oversB = match?.oversB ?? 0;

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
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}
        </style>

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
          {/* 🏆 Winner / Status Banner */}
          <div
            style={{
              background:
                status === "Completed"
                  ? "linear-gradient(135deg, #16a34a, #22c55e)"
                  : status === "InProgress"
                  ? "linear-gradient(135deg, #dc2626, #ef4444)"
                  : "linear-gradient(135deg, #3b82f6, #60a5fa)",
              padding: "25px",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "25px",
              fontSize: "1.8rem",
              fontWeight: "bold",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            {status === "InProgress" && (
              <div
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#fff",
                  animation: "pulse 2s infinite",
                }}
              />
            )}
            {status === "Completed"
              ? `🏆 ${winnerName} Won the Match!`
              : status === "InProgress"
              ? `🔴 LIVE: ${teamAName} vs ${teamBName}`
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
              {status === "InProgress" && (
                <span
                  style={{
                    marginLeft: "10px",
                    color: "#dc2626",
                    fontWeight: "bold",
                  }}
                >
                  (Updates every 5s)
                </span>
              )}
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
                {scoreA}/{wicketsA}
              </p>
              <p style={{ fontSize: "1rem", color: "#64748b" }}>
                Overs: {oversA}
              </p>
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
                {scoreB}/{wicketsB}
              </p>
              <p style={{ fontSize: "1rem", color: "#64748b" }}>
                Overs: {oversB}
              </p>
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
              border: "none",
              fontSize: "1rem",
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