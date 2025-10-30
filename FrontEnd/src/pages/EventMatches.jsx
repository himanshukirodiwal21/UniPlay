import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MatchListing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("live");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = {
    pageWrapper: {
      minHeight: "70vh",
      width: "100%",
      background:
        "linear-gradient(135deg, rgb(75, 85, 99) 0%, rgb(107, 114, 128) 50%, rgb(156, 163, 175) 100%)",
      padding: "40px 20px",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px 20px",
    },
    tabsContainer: {
      display: "flex",
      gap: "10px",
      marginBottom: "30px",
    },
    tab: {
      flex: 1,
      padding: "12px",
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.3s",
      fontWeight: "500",
      fontSize: "16px",
      background: "white",
    },
    tabActive: {
      background: "#667eea",
      color: "white",
      borderColor: "#667eea",
    },
    matchCard: {
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      padding: "20px",
      marginBottom: "20px",
      transition: "all 0.3s",
      background: "white",
      cursor: "pointer",
    },
    matchHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
    },
    teamNames: {
      fontWeight: "bold",
      fontSize: "18px",
      color: "#2c3e50",
    },
    liveBadge: {
      background: "#e74c3c",
      color: "white",
      padding: "6px 16px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
      animation: "pulse 2s infinite",
    },
    scoreLarge: {
      fontSize: "1.8rem",
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: "10px",
    },
    matchInfo: {
      color: "#7f8c8d",
      fontSize: "14px",
    },
  };

  // 🧠 Fetch matches dynamically from backend
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const status =
          activeTab === "live"
            ? "InProgress"
            : activeTab === "upcoming"
            ? "Scheduled"
            : "Completed";

        const res = await fetch(
          `http://localhost:8000/api/v1/matches?status=${status}`
        );
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data = await res.json();
        setMatches(data);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [activeTab]);

  const handleMatchClick = (match) => {
    if (activeTab === "live") {
      navigate(`/live-match/${match._id}`, { state: { match } });
    } else if (activeTab === "completed") {
      navigate(`/match-result/${match._id}`, { state: { match } });
    } else if (activeTab === "upcoming") {
      alert("Match has not started yet!");
    }
  };

  const renderMatches = () => {
    if (loading) return <p>Loading matches...</p>;
    if (!matches.length) return <p>No matches found.</p>;

    return matches.map((match) => (
      <div
        key={match._id}
        style={styles.matchCard}
        onClick={() => handleMatchClick(match)}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = "#667eea";
          e.currentTarget.style.boxShadow =
            "0 5px 15px rgba(102, 126, 234, 0.3)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = "#e0e0e0";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={styles.matchHeader}>
          <span style={styles.teamNames}>
            {match.teamA?.name || "Team A"} vs {match.teamB?.name || "Team B"}
          </span>
          {match.status === "InProgress" && (
            <span style={styles.liveBadge}>🔴 LIVE</span>
          )}
        </div>

        {match.status === "Completed" ? (
          <>
            <div style={styles.scoreLarge}>
              {match.scoreA} - {match.scoreB}
            </div>
            <div
              style={{
                ...styles.matchInfo,
                color: "#27ae60",
                fontWeight: "600",
              }}
            >
              ✅ Winner: {match.winner?.name || "TBD"}
            </div>
          </>
        ) : (
          <div style={styles.matchInfo}>
            📅{" "}
            {match.scheduledTime
              ? new Date(match.scheduledTime).toLocaleString()
              : "TBD"}{" "}
            • 📍 {match.venue || "TBD"}
          </div>
        )}
      </div>
    ));
  };

  return (
    <>
      <Header />
      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          <style>
            {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}
          </style>

          <div style={styles.tabsContainer}>
            <div
              style={{
                ...styles.tab,
                ...(activeTab === "live" ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab("live")}
            >
              🔴 LIVE
            </div>
            <div
              style={{
                ...styles.tab,
                ...(activeTab === "upcoming" ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab("upcoming")}
            >
              📅 Upcoming
            </div>
            <div
              style={{
                ...styles.tab,
                ...(activeTab === "completed" ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab("completed")}
            >
              ✅ Completed
            </div>
          </div>

          {renderMatches()}
        </div>
      </div>
      <Footer />
    </>
  );
}
