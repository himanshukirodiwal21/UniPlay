// src/pages/EventMatches.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const BACKEND_URL = 'http://localhost:8000';

export default function EventMatches() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

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
    header: {
      textAlign: "center",
      marginBottom: "30px",
      color: "white",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    subtitle: {
      fontSize: "1.1rem",
      opacity: 0.9,
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
      position: "relative",
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
    upcomingBadge: {
      background: "#3498db",
      color: "white",
      padding: "6px 16px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    completedBadge: {
      background: "#27ae60",
      color: "white",
      padding: "6px 16px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    scoreLarge: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: "10px",
      letterSpacing: "2px",
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },
    liveScoreInfo: {
      color: "#e74c3c",
      fontSize: "14px",
      fontWeight: "600",
      marginTop: "8px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flexWrap: "wrap",
    },
    matchInfo: {
      color: "#7f8c8d",
      fontSize: "14px",
      marginTop: "10px",
    },
    errorBox: {
      background: "#fee2e2",
      border: "2px solid #ef4444",
      borderRadius: "8px",
      padding: "16px",
      color: "#dc2626",
      textAlign: "center",
      marginTop: "20px",
    },
    loadingBox: {
      textAlign: "center",
      padding: "40px",
      color: "#6b7280",
      fontSize: "18px",
    },
    emptyBox: {
      textAlign: "center",
      padding: "40px",
      color: "#6b7280",
    },
    emptyIcon: {
      fontSize: "48px",
      marginBottom: "16px",
    },
    emptyText: {
      fontSize: "18px",
      fontWeight: "600",
    },
    refreshIndicator: {
      position: "fixed",
      top: "80px",
      right: "20px",
      background: "rgba(102, 126, 234, 0.9)",
      color: "white",
      padding: "8px 16px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
      zIndex: 1000,
    },
    liveIndicator: {
      position: "absolute",
      top: "10px",
      left: "10px",
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      background: "#e74c3c",
      animation: "pulse 2s infinite",
    },
  };

  // ✅ Fetch matches when tab changes + Auto-refresh every 5 seconds for live tab
  useEffect(() => {
    fetchMatches();
    
    const interval = setInterval(() => {
      fetchMatches();
    }, activeTab === "live" ? 5000 : 30000); // 5s for live, 30s for others

    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchMatches = async () => {
    try {
      // Don't show loading spinner if already have data
      if (matches.length === 0) {
        setLoading(true);
      }
      setError(null);

      const statusMap = {
        live: "InProgress",
        upcoming: "Scheduled",
        completed: "Completed",
      };

      const status = statusMap[activeTab];
      const url = `${BACKEND_URL}/api/v1/matches?status=${status}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`📊 Fetched ${data.data?.length || 0} ${activeTab} matches`);

      setMatches(data.data || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("❌ Fetch Error:", err);

      if (err.message.includes("Failed to fetch")) {
        setError("Cannot connect to server. Is backend running?");
      } else {
        setError(err.message);
      }
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClick = async (match) => {
    if (activeTab === "live") {
      // Check if live match is initialized
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/live-matches/${match._id}`);
        const data = await response.json();
        
        if (data.success) {
          // Live match exists, navigate to viewer
          navigate(`/live-match/${match._id}`, { state: { match } });
        } else {
          // Not initialized yet, ask to initialize
          const shouldInitialize = window.confirm(
            "Live match not initialized yet.\n\nDo you want to initialize it now?"
          );
          if (shouldInitialize) {
            navigate(`/scorer-dashboard/${match._id}`, { state: { match } });
          }
        }
      } catch (err) {
        console.error("Error checking live match:", err);
        navigate(`/live-match/${match._id}`, { state: { match } });
      }
    } else if (activeTab === "completed") {
      navigate(`/match-result/${match._id}`, { state: { match } });
    } else if (activeTab === "upcoming") {
      const matchTime = new Date(match.scheduledTime);
      const now = new Date();
      const minutesUntilStart = Math.floor((matchTime - now) / (1000 * 60));
      
      if (minutesUntilStart <= 30 && minutesUntilStart > 0) {
        const shouldStart = window.confirm(
          `Match starts in ${minutesUntilStart} minutes.\n\nDo you want to initialize scoring?`
        );
        if (shouldStart) {
          navigate(`/scorer-dashboard/${match._id}`, { state: { match } });
        }
      } else {
        alert(`Match scheduled for: ${matchTime.toLocaleString('en-IN')}`);
      }
    }
  };

  const renderMatches = () => {
    if (loading && matches.length === 0) {
      return (
        <div style={styles.loadingBox}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
          <div>Loading matches...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      );
    }

    if (!matches.length) {
      const emptyMessages = {
        live: { icon: "🏏", text: "No live matches at the moment" },
        upcoming: { icon: "📅", text: "No upcoming matches scheduled" },
        completed: { icon: "🏆", text: "No completed matches yet" },
      };

      const message = emptyMessages[activeTab];

      return (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>{message.icon}</div>
          <p style={styles.emptyText}>{message.text}</p>
        </div>
      );
    }

    return matches.map((match) => {
      const isLive = match.status === "InProgress";
      const isCompleted = match.status === "Completed";

      return (
        <div
          key={match._id}
          style={styles.matchCard}
          onClick={() => handleMatchClick(match)}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.boxShadow = "0 5px 15px rgba(102, 126, 234, 0.3)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "#e0e0e0";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Live Indicator Dot */}
          {isLive && <div style={styles.liveIndicator}></div>}

          <div style={styles.matchHeader}>
            <span style={styles.teamNames}>
              {match.teamA?.teamName || "Team A"} vs {match.teamB?.teamName || "Team B"}
            </span>
            
            {isLive && <span style={styles.liveBadge}>🔴 LIVE</span>}
            {match.status === "Scheduled" && <span style={styles.upcomingBadge}>📅 Upcoming</span>}
            {isCompleted && <span style={styles.completedBadge}>✅ Completed</span>}
          </div>

          {/* Score Display for Live and Completed Matches */}
          {(isLive || isCompleted) && (
            <>
              <div style={styles.scoreLarge}>
                <span>{match.scoreA || 0}</span>
                <span style={{ fontSize: "1.5rem", color: "#94a3b8" }}>-</span>
                <span>{match.scoreB || 0}</span>
              </div>

              {/* Live Match Extra Info */}
              {isLive && (
                <div style={styles.liveScoreInfo}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#e74c3c',
                    display: 'inline-block',
                    animation: 'pulse 2s infinite'
                  }}></span>
                  <span>Live scoring in progress</span>
                  <span>•</span>
                  <span>Click to watch</span>
                </div>
              )}

              {/* Completed Match Winner */}
              {isCompleted && (
                <div style={{
                  ...styles.matchInfo,
                  color: "#27ae60",
                  fontWeight: "600",
                  marginTop: "12px"
                }}>
                  🏆 Winner: {match.winner?.teamName || "TBD"}
                </div>
              )}
            </>
          )}

          {/* Upcoming Match Info */}
          {match.status === "Scheduled" && (
            <>
              <div style={styles.matchInfo}>
                📅{" "}
                {match.scheduledTime
                  ? new Date(match.scheduledTime).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "TBD"}
              </div>
              <div style={styles.matchInfo}>
                📍 {match.venue || "Venue TBD"}
              </div>
              <div style={styles.matchInfo}>
                🏟️ {match.stage || "Stage"} - Round {match.round || "TBD"}
              </div>
            </>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <Header />
      <div style={styles.pageWrapper}>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}
        </style>

        {/* Refresh Indicator */}
        {loading && matches.length > 0 && (
          <div style={styles.refreshIndicator}>🔄 Updating...</div>
        )}

        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>🏏 Match Center</h1>
            <p style={styles.subtitle}>
              {activeTab === "live" ? "Live updates every 5 seconds" : "Auto-updates every 30 seconds"}
            </p>
          </div>

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