import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function EventMatches() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      fontSize: "1.8rem",
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: "10px",
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
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const statusMap = {
          live: "InProgress",
          upcoming: "Scheduled",
          completed: "Completed",
        };

        const status = statusMap[activeTab];
        const url = `http://localhost:8000/api/v1/matches?status=${status}`;

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
        console.log("📊 Matches Data:", data.data);

        // ✅ Frontend filtering for live matches
        let processedMatches = data.data || [];
        
        if (activeTab === "live") {
          const now = new Date();
          processedMatches = processedMatches.filter(match => {
            if (!match.scheduledTime) return false;
            
            const matchTime = new Date(match.scheduledTime);
            const matchEndTime = new Date(matchTime.getTime() + 3 * 60 * 60 * 1000);
            
            const isLive = now >= matchTime && now <= matchEndTime;
            
            console.log(`Match: ${match.teamA?.teamName} vs ${match.teamB?.teamName}`);
            console.log(`  Current: ${now.toLocaleString('en-IN')}`);
            console.log(`  Start: ${matchTime.toLocaleString('en-IN')}`);
            console.log(`  End: ${matchEndTime.toLocaleString('en-IN')}`);
            console.log(`  Is Live: ${isLive}`);
            
            return isLive;
          });
          console.log(`🔴 Live matches filtered: ${processedMatches.length}`);
        }

        setMatches(processedMatches);
      } catch (err) {
        console.error("❌ Fetch Error:", err);

        if (err.message.includes("Failed to fetch")) {
          setError(
            "Cannot connect to server. Is backend running on http://localhost:8000?"
          );
        } else {
          setError(err.message);
        }
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    
    // ✅ Auto-refresh every 10 seconds to detect live matches
    const interval = setInterval(() => {
      fetchMatches();
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleMatchClick = (match) => {
    // ✅ Check if match is actually live (time-based)
    const now = new Date();
    const matchTime = new Date(match.scheduledTime);
    const matchEndTime = new Date(matchTime.getTime() + 3 * 60 * 60 * 1000);
    const isLive = now >= matchTime && now <= matchEndTime;

    if (isLive || match.status === "InProgress") {
      navigate(`/live-match/${match._id}`, { state: { match } });
    } else if (match.status === "Completed") {
      navigate(`/match-result/${match._id}`, { state: { match } });
    } else if (match.status === "Scheduled") {
      // ✅ Check if match is starting soon (within 15 minutes)
      const timeDiff = matchTime - now;
      const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));
      
      if (minutesUntilStart <= 15 && minutesUntilStart >= 0) {
        alert(`Match starting in ${minutesUntilStart} minutes! 🏏`);
      } else {
        alert("Match has not started yet!");
      }
    }
  };

  const renderMatches = () => {
    if (loading) {
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
      // ✅ Real-time check for live status
      const now = new Date();
      const matchTime = new Date(match.scheduledTime);
      const matchEndTime = new Date(matchTime.getTime() + 3 * 60 * 60 * 1000);
      const isLive = now >= matchTime && now <= matchEndTime;

      return (
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
              {match.teamA?.teamName || "Team A"} vs{" "}
              {match.teamB?.teamName || "Team B"}
            </span>
            {isLive && <span style={styles.liveBadge}>🔴 LIVE</span>}
            {match.status === "Scheduled" && !isLive && (
              <span style={styles.upcomingBadge}>📅 Upcoming</span>
            )}
            {match.status === "Completed" && (
              <span style={styles.completedBadge}>✅ Completed</span>
            )}
          </div>

          {match.status === "Completed" ? (
            <>
              <div style={styles.scoreLarge}>
                {match.scoreA || 0} - {match.scoreB || 0}
              </div>
              <div
                style={{
                  ...styles.matchInfo,
                  color: "#27ae60",
                  fontWeight: "600",
                }}
              >
                🏆 Winner: {match.winner?.teamName || "TBD"}
              </div>
            </>
          ) : (
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