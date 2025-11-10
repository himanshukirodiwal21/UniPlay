// src/pages/ScorerDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Play,
  BarChart3,
  Calendar,
  MapPin,
  Clock,
  LogOut,
  User,
  ArrowLeft,
  CheckCircle,
  Trophy,
} from "lucide-react";
import { io } from "socket.io-client";
import Footer from "../components/Footer";
import Header from "../components/Header";

const BACKEND_URL = "http://localhost:8000";
let socket = null;

// ✅ Helper functions are defined OUTSIDE the component
const getStatusBadge = (status) => {
  const badges = {
    InProgress: {
      bg: "#ef4444",
      text: "🔴 LIVE",
      animate: true,
    },
    Scheduled: {
      bg: "#3b82f6",
      text: "📅 Upcoming",
      animate: false,
    },
    Completed: {
      bg: "#10b981",
      text: "✅ Completed",
      animate: false,
    },
  };

  const badge = badges[status] || badges["Scheduled"];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 12px",
        background: badge.bg,
        color: "white",
        fontSize: "12px",
        fontWeight: "bold",
        borderRadius: "9999px",
        animation: badge.animate ? "pulse 2s infinite" : "none",
      }}
    >
      {badge.text}
    </span>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  }
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ✅ Styles object is defined OUTSIDE the component
const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, rgb(75, 85, 99) 0%, rgb(107, 114, 128) 50%, rgb(156, 163, 175) 100%)",
  },
  header: {
    background: "#111827",
    color: "white",
    boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
  },
  headerContent: {
    maxWidth: "1152px",
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  userLabel: {
    fontSize: "14px",
    color: "#9ca3af",
  },
  userName: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "#6366f1",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "#dc2626",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  mainContent: {
    maxWidth: "1152px",
    margin: "0 auto",
    padding: "32px 24px",
  },
  welcomeCard: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
    padding: "32px",
    marginBottom: "32px",
  },
  welcomeTitle: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "8px",
  },
  welcomeText: {
    color: "#4b5563",
    fontSize: "18px",
  },
  actionsCard: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
    padding: "32px",
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "16px 24px",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
    transition: "all 0.3s",
  },
  tabsWrapper: {
    display: "flex",
    gap: "16px",
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: "12px",
    marginBottom: "24px",
  },
  tab: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#6b7280",
    borderBottom: "3px solid transparent",
    transition: "all 0.3s",
    position: "relative",
    top: "2px",
  },
  activeTab: {
    color: "#7c3aed",
    borderBottomColor: "#7c3aed",
  },
  matchCard: {
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "16px",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  matchHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "12px",
  },
  matchTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1f2937",
  },
  matchDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    color: "#4b5563",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  continueBtn: {
    width: "100%",
    background: "#16a34a",
    color: "white",
    fontWeight: "bold",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s",
    marginTop: "16px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginTop: "32px",
  },
  statCard: {
    borderRadius: "12px",
    padding: "24px",
    color: "white",
    boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
  },
  statLabel: {
    opacity: 0.9,
    marginBottom: "8px",
    fontSize: "14px",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "bold",
  },
  scoreDisplay: {
    background: "#f8f9fa",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "20px",
    borderLeft: "6px solid #7c3aed",
  },
  scoreLarge: {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "8px",
  },
  playerBox: {
    flex: 1,
    background: "#f8f9fa",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  playerLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "4px",
  },
  // This style is now used for <select>
  playerInput: {
    width: "100%",
    padding: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "2px solid #e5e7eb",
    borderRadius: "6px",
    marginTop: "4px",
    background: "white", // Ensure select bg is white
  },
  ballButtonsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "20px",
  },
  ballButton: {
    background: "white",
    border: "3px solid #7c3aed",
    color: "#7c3aed",
    padding: "20px",
    borderRadius: "12px",
    fontSize: "24px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s",
    opacity: 1,
  },
  endInningsBtn: {
    width: "100%",
    background: "#dc2626",
    color: "white",
    fontWeight: "bold",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s",
    marginTop: "20px",
    fontSize: "16px",
  },
  lastBallsContainer: {
    background: "#f8f9fa",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  lastBallsTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: "12px",
  },
  lastBallsList: {
    display: "flex",
    gap: "8px",
  },
  lastBall: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "16px",
  },
  scoreBox: {
    background: "#f3f4f6",
    padding: "16px",
    borderRadius: "8px",
    marginTop: "16px",
  },
  score: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1f2937",
  },
  emptyState: {
    textAlign: "center",
    padding: "64px 24px",
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
  loadingSpinner: {
    textAlign: "center",
    padding: "48px",
    color: "#6b7280",
  },
  errorBox: {
    background: "#fee2e2",
    border: "2px solid #ef4444",
    borderRadius: "8px",
    padding: "16px",
    color: "#dc2626",
    textAlign: "center",
  },
  warningBox: {
    background: "#fef3c7",
    border: "2px solid #f59e0b",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#92400e",
  },
};

// ✅ ScoringInterface component is defined OUTSIDE
const ScoringInterface = ({
  liveMatchData,
  onStrikeBatsman,
  setOnStrikeBatsman,
  nonStrikeBatsman,
  setNonStrikeBatsman,
  currentBowler,
  setCurrentBowler,
  battingTeamPlayers,
  bowlingTeamPlayers,
  lastBalls,
  handleBallClick,
  handleEndInnings,
  scoringLoading,
}) => {
  if (!liveMatchData) {
    return (
      <div style={styles.mainContent}>
        <div style={styles.loadingSpinner}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
          <div>Loading live match data...</div>
        </div>
      </div>
    );
  }

  const currentInnings =
    liveMatchData.innings[liveMatchData.currentInnings - 1];
  const totalOvers = liveMatchData.totalOvers || 20;
  const isInningsComplete =
    currentInnings.wickets >= 10 || currentInnings.overs >= totalOvers;

  // Helper function to create filtered player list for dropdowns
  const getBatsmanOptions = (isStrike) => {
    const otherBatsmanId = isStrike ? nonStrikeBatsman : onStrikeBatsman;
    return battingTeamPlayers
      .filter(p => p._id !== otherBatsmanId) // Can't be on strike and non-strike
      .map(player => (
        <option key={player._id} value={player._id}>
          {player.name}
        </option>
      ));
  };
  
  const getBowlerOptions = () => {
    return bowlingTeamPlayers.map(player => (
      <option key={player._id} value={player._id}>
        {player.name}
      </option>
    ));
  };


  return (
    <div style={styles.mainContent}>
      <div style={styles.actionsCard}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "8px",
            }}
          >
            {liveMatchData.teamA?.teamName || "Team A"} vs{" "}
            {liveMatchData.teamB?.teamName || "Team B"}
          </h2>
          {getStatusBadge("InProgress")}
        </div>

        {/* ✅ WARNING: Innings Complete */}
        {isInningsComplete && (
          <div style={styles.warningBox}>
            <CheckCircle size={24} color="#f59e0b" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                {currentInnings.overs >= totalOvers
                  ? `Innings Complete - ${totalOvers} Overs Finished!`
                  : "Innings Complete - 10 Wickets Down!"}
              </div>
              <div style={{ fontSize: "14px" }}>
                Click "End Innings" button below to proceed to the next
                innings.
              </div>
            </div>
          </div>
        )}

        <div style={styles.scoreDisplay}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#6b7280",
            }}
          >
            {currentInnings.battingTeam?.teamName || "Batting Team"} - Innings{" "}
            {liveMatchData.currentInnings}
          </div>
          <div style={styles.scoreLarge}>
            {currentInnings.score}/{currentInnings.wickets}
          </div>
          <div style={{ color: "#6b7280", fontSize: "16px" }}>
            {currentInnings.overs} overs • Run Rate:{" "}
            {(currentInnings.score / (currentInnings.overs || 1)).toFixed(2)}
          </div>
          {/* ✅ Wickets indicator */}
          <div
            style={{
              marginTop: "12px",
              padding: "8px",
              background: isInningsComplete ? "#fee2e2" : "#e0e7ff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: isInningsComplete ? "#dc2626" : "#4f46e5",
            }}
          >
            {isInningsComplete
              ? "⚠️ All Out - 10 Wickets Down"
              : `Wickets Remaining: ${10 - currentInnings.wickets}/10`}
          </div>
        </div>

        {/* Player Input Fields with <select> */}
        <div style={{ marginBottom: "24px" }}>

          <div style={styles.playerBox}>
            <div style={styles.playerLabel}>🏏 On-Strike Batsman</div>
            <select
              style={styles.playerInput}
              value={onStrikeBatsman}
              onChange={(e) => setOnStrikeBatsman(e.target.value)}
              disabled={isInningsComplete || battingTeamPlayers.length === 0}
            >
              <option value="">-- Select On-Strike --</option>
              {getBatsmanOptions(true)}
            </select>
            {battingTeamPlayers.length === 0 && (
              <div style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>Loading players...</div>
            )}
          </div>

          <div style={styles.playerBox}>
            <div style={styles.playerLabel}>🏃 Non-Strike Batsman</div>
            <select
              style={styles.playerInput}
              value={nonStrikeBatsman}
              onChange={(e) => setNonStrikeBatsman(e.target.value)}
              disabled={isInningsComplete || battingTeamPlayers.length === 0}
            >
              <option value="">-- Select Non-Strike --</option>
              {getBatsmanOptions(false)}
            </select>
          </div>

          <div style={styles.playerBox}>
            <div style={styles.playerLabel}>⚾ Current Bowler</div>
            <select
              style={styles.playerInput}
              value={currentBowler}
              onChange={(e) => setCurrentBowler(e.target.value)}
              disabled={isInningsComplete || bowlingTeamPlayers.length === 0}
            >
              <option value="">-- Select Bowler --</option>
              {getBowlerOptions()}
            </select>
            {bowlingTeamPlayers.length === 0 && battingTeamPlayers.length > 0 && (
              <div style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>Loading bowlers...</div>
            )}
          </div>

        </div>

        <div style={styles.lastBallsContainer}>
          <div style={styles.lastBallsTitle}>Last 6 Balls:</div>
          <div style={styles.lastBallsList}>
            {lastBalls.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No balls yet</div>
            ) : (
              lastBalls.map((ball, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.lastBall,
                    background:
                      ball === "W"
                        ? "#ef4444"
                        : ball === "6"
                        ? "#7c3aed"
                        : ball === "4"
                        ? "#3b82f6"
                        : "#e5e7eb",
                    color: ["W", "6", "4"].includes(ball)
                      ? "white"
                      : "#1f2937",
                  }}
                >
                  {ball}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ Ball Buttons - Disabled if innings complete */}
        <div style={styles.ballButtonsGrid}>
          {["0", "1", "2", "3", "4", "6", "W", "WD"].map((value) => (
            <button
              key={value}
              style={{
                ...styles.ballButton,
                borderColor: value === "W" ? "#ef4444" : "#7c3aed",
                color: value === "W" ? "#ef4444" : "#7c3aed",
                opacity: scoringLoading || isInningsComplete ? 0.5 : 1,
                cursor:
                  scoringLoading || isInningsComplete
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={() => handleBallClick(value)}
              disabled={scoringLoading || isInningsComplete}
              onMouseEnter={(e) => {
                if (!scoringLoading && !isInningsComplete) {
                  e.target.style.background =
                    value === "W" ? "#ef4444" : "#7c3aed";
                  e.target.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.color = value === "W" ? "#ef4444" : "#7c3aed";
              }}
            >
              {value}
            </button>
          ))}
        </div>

        {scoringLoading && (
          <div
            style={{
              textAlign: "center",
              color: "#6b7280",
              marginTop: "16px",
            }}
          >
            ⏳ Updating score...
          </div>
        )}

        {/* ✅ END INNINGS BUTTON */}
        <button
          style={styles.endInningsBtn}
          onClick={handleEndInnings}
          disabled={scoringLoading}
          onMouseEnter={(e) => {
            if (!scoringLoading) e.target.style.background = "#b91c1c";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#dc2626";
          }}
        >
          <CheckCircle size={20} />
          <span>End Innings {liveMatchData.currentInnings}</span>
        </button>
      </div>
    </div>
  );
};

// ✅ Dashboard component is defined OUTSIDE
const Dashboard = ({
  scorerName,
  activeTab,
  setActiveTab,
  handleCreateMatch,
  handleStartScoring,
  handleViewStats,
  matches,
  renderedMatches,
}) => {
  const activeMatchesCount = matches.filter(
    (m) => m.status === "InProgress"
  ).length;
  const upcomingMatchesCount = matches.filter(
    (m) => m.status === "Scheduled"
  ).length;

  return (
    <div style={styles.mainContent}>
      <div style={styles.welcomeCard}>
        <h1 style={styles.welcomeTitle}>🎯 Scorer Dashboard</h1>
        <p style={styles.welcomeText}>
          Welcome back, {scorerName}! Ready to score some matches?
        </p>
      </div>

      <div style={styles.actionsCard}>
        <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
        <div style={styles.buttonGrid}>
          <button
            style={{
              ...styles.actionBtn,
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            }}
            onClick={handleCreateMatch}
            onMouseEnter={(e) =>
              (e.target.style.background =
                "linear-gradient(135deg, #6d28d9, #5b21b6)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background =
                "linear-gradient(135deg, #7c3aed, #6d28d9)")
            }
          >
            <Plus size={24} />
            <span>Create New Match</span>
          </button>

          <button
            style={{
              ...styles.actionBtn,
              background: "linear-gradient(135deg, #16a34a, #15803d)",
            }}
            onClick={() => handleStartScoring()}
            onMouseEnter={(e) =>
              (e.target.style.background =
                "linear-gradient(135deg, #15803d, #166534)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background =
                "linear-gradient(135deg, #16a34a, #15803d)")
            }
          >
            <Play size={24} />
            <span>Start Scoring</span>
          </button>

          <button
            style={{
              ...styles.actionBtn,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            }}
            onClick={handleViewStats}
            onMouseEnter={(e) =>
              (e.target.style.background =
                "linear-gradient(135deg, #1d4ed8, #1e40af)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background =
                "linear-gradient(135deg, #2563eb, #1d4ed8)")
            }
          >
            <BarChart3 size={24} />
            <span>View Statistics</span>
          </button>
        </div>
      </div>

      <div style={styles.actionsCard}>
        <h2 style={styles.sectionTitle}>📋 My Assigned Matches</h2>

        <div style={styles.tabsWrapper}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "live" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("live")}
          >
            🔴 Live
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "upcoming" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("upcoming")}
          >
            📅 Upcoming
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "completed" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("completed")}
          >
            ✅ Completed
          </button>
        </div>

        {renderedMatches}
      </div>

      <div style={styles.statsGrid}>
        <div
          style={{
            ...styles.statCard,
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          }}
        >
          <div style={styles.statLabel}>Total Matches Scored</div>
          <div style={styles.statValue}>24</div>
        </div>
        <div
          style={{
            ...styles.statCard,
            background: "linear-gradient(135deg, #10b981, #059669)",
          }}
        >
          <div style={styles.statLabel}>Active Matches</div>
          <div style={styles.statValue}>{activeMatchesCount}</div>
        </div>
        <div
          style={{
            ...styles.statCard,
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          }}
        >
          <div style={styles.statLabel}>Upcoming Matches</div>
          <div style={styles.statValue}>{upcomingMatchesCount}</div>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// ✅ MAIN COMPONENT
// ===============================================
export default function ScorerDashboard() {
  const [scorerName] = useState("Rahul Kumar");
  const [currentView, setCurrentView] = useState("dashboard");
  const [currentMatch, setCurrentMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  // API data states
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live match data
  const [liveMatchData, setLiveMatchData] = useState(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  // --- NEW Scoring state ---
  const [onStrikeBatsman, setOnStrikeBatsman] = useState("");
  const [nonStrikeBatsman, setNonStrikeBatsman] = useState("");
  const [currentBowler, setCurrentBowler] = useState("");
  const [battingTeamPlayers, setBattingTeamPlayers] = useState([]);
  const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState([]);
  const [lastOver, setLastOver] = useState(0); // To track over changes
  const [lastBalls, setLastBalls] = useState([]);
  // --- END NEW Scoring state ---

  // Fetch matches when tab changes
  useEffect(() => {
    if (currentView === "dashboard") {
      fetchMatches();
    }
  }, [activeTab, currentView]);

  // Socket.IO connection
  useEffect(() => {
    if (currentMatch && currentView === "scoring") {
      socket = io(BACKEND_URL);

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
        socket.emit("join-match", currentMatch._id);
      });

      socket.on("ball-updated", (data) => {
        console.log("🏏 Ball update received:", data);
        fetchLiveMatchData();
      });

      socket.on("innings-complete", (data) => {
        console.log("✅ Innings complete:", data);
        alert("Innings completed! Starting next innings...");
        fetchLiveMatchData();
        // Clear fields
        setOnStrikeBatsman("");
        setNonStrikeBatsman("");
        setCurrentBowler("");
        setBattingTeamPlayers([]);
        setBowlingTeamPlayers([]);
        setLastOver(0);
        setLastBalls([]);
      });

      socket.on("match-complete", (data) => {
        console.log("🏆 Match complete:", data);
        alert("Match completed! Redirecting to dashboard...");
        setTimeout(() => {
          handleBackToDashboard();
        }, 2000);
      });

      return () => {
        if (socket) {
          socket.disconnect();
          console.log("❌ Socket disconnected");
        }
      };
    }
  }, [currentMatch, currentView]);

  // Fetch live match data
  useEffect(() => {
    if (currentMatch && currentView === "scoring") {
      fetchLiveMatchData();
    }
  }, [currentMatch, currentView]);

  // --- NEW FUNCTION to fetch players ---
  const fetchTeamPlayers = async (battingTeamId, bowlingTeamId) => {
  if (!battingTeamId || !bowlingTeamId) return;
  try {
    console.log(`Fetching players for Batting: ${battingTeamId}, Bowling: ${bowlingTeamId}`);
    
    // ✅ Fetch batting team
    const batResponse = await fetch(`${BACKEND_URL}/api/v1/team-registrations/${battingTeamId}`);
    if (!batResponse.ok) throw new Error('Failed to fetch batting team');
    const batData = await batResponse.json();
    
    // ✅ Map to use playerId if available, else fallback to team player _id
    const battingPlayers = (batData.data.players || []).map(teamPlayer => ({
      _id: teamPlayer.playerId || teamPlayer._id, // Use playerId first!
      name: teamPlayer.name,
      role: teamPlayer.role,
      isLinked: !!teamPlayer.playerId
    }));
    
    setBattingTeamPlayers(battingPlayers);

    // ✅ Fetch bowling team
    const bowlResponse = await fetch(`${BACKEND_URL}/api/v1/team-registrations/${bowlingTeamId}`);
    if (!bowlResponse.ok) throw new Error('Failed to fetch bowling team');
    const bowlData = await bowlResponse.json();
    
    const bowlingPlayers = (bowlData.data.players || []).map(teamPlayer => ({
      _id: teamPlayer.playerId || teamPlayer._id, // Use playerId first!
      name: teamPlayer.name,
      role: teamPlayer.role,
      isLinked: !!teamPlayer.playerId
    }));
    
    setBowlingTeamPlayers(bowlingPlayers);

    // ✅ Warning if players not linked
    const unlinkedBatting = battingPlayers.filter(p => !p.isLinked);
    const unlinkedBowling = bowlingPlayers.filter(p => !p.isLinked);
    
    if (unlinkedBatting.length > 0 || unlinkedBowling.length > 0) {
      console.warn('⚠️ Some players not linked to Player collection. Stats may not update!', {
        batting: unlinkedBatting.map(p => p.name),
        bowling: unlinkedBowling.map(p => p.name)
      });
    }

    console.log("✅ Players fetched");

  } catch (err) {
    console.error("❌ Error fetching team players:", err);
    alert(`Error fetching players: ${err.message}.`);
  }
};
  
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
      const url = `${BACKEND_URL}/api/v1/matches?status=${status}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if ((activeTab === "live" || activeTab === "completed") && data.data?.length > 0) {
        const matchesWithLiveData = await Promise.all(
          data.data.map(async (match) => {
            try {
              const liveResponse = await fetch(`${BACKEND_URL}/api/v1/live-matches/${match._id}`);
              const liveData = await liveResponse.json();
              
              if (liveData.success && liveData.data.innings) {
                const innings = liveData.data.innings;
                
                const getTeamScore = (teamId) => {
                  const currentInnings = innings[liveData.data.currentInnings - 1];
                  if (currentInnings?.battingTeam?._id?.toString() === teamId?.toString()) {
                    return {
                      score: currentInnings.score || 0,
                      wickets: currentInnings.wickets || 0,
                      overs: currentInnings.overs || 0,
                    };
                  }
                  
                  if (innings[0]?.battingTeam?._id?.toString() === teamId?.toString()) {
                    return {
                      score: innings[0].score || 0,
                      wickets: innings[0].wickets || 0,
                      overs: innings[0].overs || 0,
                    };
                  }
                  
                  if (innings[1]?.battingTeam?._id?.toString() === teamId?.toString()) {
                    return {
                      score: innings[1].score || 0,
                      wickets: innings[1].wickets || 0,
                      overs: innings[1].overs || 0,
                    };
                  }
                  
                  return { score: 0, wickets: 0, overs: 0 };
                };

                const teamAScore = getTeamScore(match.teamA?._id);
                const teamBScore = getTeamScore(match.teamB?._id);

                return {
                  ...match,
                  scoreA: teamAScore.score,
                  wicketsA: teamAScore.wickets,
                  oversA: teamAScore.overs,
                  scoreB: teamBScore.score,
                  wicketsB: teamBScore.wickets,
                  oversB: teamBScore.overs,
                };
              }
              return match;
            } catch (err) {
              console.error(`Error fetching live data for match ${match._id}:`, err);
              return match;
            }
          })
        );
        setMatches(matchesWithLiveData);
      } else {
        setMatches(data.data || []);
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot connect to server. Is backend running?"
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATED fetchLiveMatchData ---
  const fetchLiveMatchData = async () => {
    if (!currentMatch) return null;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/live-matches/${currentMatch._id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 Live Match Data:", data.data);
      setLiveMatchData(data.data);

      // --- NEW LOGIC ---
      // If player lists are empty (e.g., first load or new innings), fetch them.
      if (data.data.innings && (battingTeamPlayers.length === 0 || bowlingTeamPlayers.length === 0)) {
        const currentInnings = data.data.innings[data.data.currentInnings - 1];
        const battingTeamId = currentInnings.battingTeam?._id;
        const bowlingTeamId = currentInnings.bowlingTeam?._id;
        
        if (battingTeamId && bowlingTeamId) {
          // Pass the IDs from the *LiveMatch* model, which should link to TeamRegistration
          await fetchTeamPlayers(battingTeamId, bowlingTeamId);
          // Set initial over number
          setLastOver(Math.floor(currentInnings.overs || 0));
        }
      }
      // --- END NEW LOGIC ---

      // Update last balls
      const currentInnings = data.data.innings[data.data.currentInnings - 1];
      if (currentInnings && currentInnings.ballByBall) {
        const recent = currentInnings.ballByBall.slice(-6).reverse();
        setLastBalls(
          recent.map((b) =>
            b.runs === 0 && b.isWicket ? "W" : b.runs.toString()
          )
        );
      }
      return data.data; // Return the new data
    } catch (err) {
      console.error("❌ Error fetching live match:", err);
      return null; // Return null on error
    }
  };


  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      alert("Logged out successfully!");
    }
  };

  const handleCreateMatch = () => {
    alert("Redirecting to Create Match form...");
  };

  const handleStartScoring = async (match = null) => {
    // Check if a match is provided or if it's the first in the 'live' list
    const matchToScore = match || matches.find(m => m.status === 'InProgress') || matches[0];
    
    if (!matchToScore) {
      alert("No match available to score.");
      return;
    }

    // Check if match is already initialized
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/live-matches/${matchToScore._id}`
      );
      const data = await response.json();

      if (!data.success) {
        const shouldInitialize = window.confirm(
          "This match needs to be initialized first.\n\nDo you want to initialize it now?"
        );

        if (shouldInitialize) {
          await initializeMatch(matchToScore);
        } else {
          return;
        }
      }
    } catch (err) {
      console.error("Error checking match status:", err);
    }

    setCurrentMatch(matchToScore);
    setCurrentView("scoring");
  };

  const initializeMatch = async (match) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/live-matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId: match._id,
          tossWinner: match.teamA._id, // Default to teamA, can be made dynamic
          choice: "bat", // Default choice, can be made dynamic
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initialize match");
      }

      const result = await response.json();
      console.log("✅ Match initialized:", result);
      alert("Match initialized successfully!");
    } catch (err) {
      console.error("❌ Error initializing match:", err);
      alert(`Error initializing match: ${err.message}`);
      throw err;
    }
  };

  // --- UPDATED handleBackToDashboard ---
  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setCurrentMatch(null);
    setLiveMatchData(null);
    // Clear all scoring state
    setOnStrikeBatsman("");
    setNonStrikeBatsman("");
    setCurrentBowler("");
    setBattingTeamPlayers([]);
    setBowlingTeamPlayers([]);
    setLastOver(0);
    setLastBalls([]);
  };

  const handleViewStats = () => {
    alert("Opening statistics dashboard...");
  };

  // --- ‼️ FINAL UPDATED handleBallClick ‼️ ---
  const handleBallClick = async (value) => {
    if (!onStrikeBatsman || !nonStrikeBatsman || !currentBowler) {
      alert("Please select On-Strike Batsman, Non-Strike Batsman, and Current Bowler first!");
      return;
    }

    const currentInnings =
      liveMatchData.innings[liveMatchData.currentInnings - 1];
    if (currentInnings.wickets >= 10) {
      alert(
        'This innings is complete (10 wickets)!\n\nClick "End Innings" to proceed.'
      );
      return;
    }

    setScoringLoading(true);

    try {
      // ✅ Get IDs to send to the backend
      const battingTeamId = currentInnings.battingTeam?._id;
      const bowlingTeamId = currentInnings.bowlingTeam?._id;
      const batsmanName = battingTeamPlayers.find(p => p._id === onStrikeBatsman)?.name;
      const bowlerName = bowlingTeamPlayers.find(p => p._id === currentBowler)?.name;


      let ballData = {
        // --- IDs for saving stats ---
        batsmanId: onStrikeBatsman,
        bowlerId: currentBowler,
        battingTeamId: battingTeamId,
        bowlingTeamId: bowlingTeamId,
        
        // --- Names for commentary (optional) ---
        batsmanName: batsmanName,
        bowlerName: bowlerName,
        
        // --- Ball data ---
        runs: 0,
        extras: 0,
        extrasType: "none",
        isWicket: false,
        wicketType: "none",
        commentary: "",
      };

      // Parse button value
      if (value === "W") {
        ballData.isWicket = true;
        ballData.wicketType = "caught"; // Default
        ballData.commentary = `WICKET! ${batsmanName || 'Batsman'} is out!`;
      } else if (value === "WD") {
        ballData.extras = 1;
        ballData.extrasType = "wide";
        ballData.commentary = "Wide ball";
      } else if (value === "NB") {
        ballData.extras = 1;
        ballData.extrasType = "noBall";
        ballData.commentary = "No ball";
      } else {
        ballData.runs = parseInt(value);
        ballData.commentary =
          value === "4"
            ? "FOUR!"
            : value === "6"
            ? "SIX!"
            : `${value} run${value === "1" ? "" : "s"}`;
      }

      console.log("📤 Sending ball data:", ballData);

      const response = await fetch(
        `${BACKEND_URL}/api/v1/live-matches/${currentMatch._id}/ball`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ballData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update ball");
      }

      const result = await response.json();
      console.log("✅ Ball updated:", result);

      // Refresh live data AND get the new state
      const newLiveMatchData = await fetchLiveMatchData();
      setLastBalls([value, ...lastBalls.slice(0, 5)]);

      // --- NEW STRIKE ROTATION LOGIC ---
      if (!newLiveMatchData) return; // Exit if fetch failed

      const runs = parseInt(value);
      const isOddRun = [1, 3, 5].includes(runs);
      const isLegalBall = value !== "WD" && value !== "NB";

      // 1. Handle Wicket
      if (value === "W") {
        setOnStrikeBatsman(""); // Clear the on-strike batsman
        
        const updatedInnings = newLiveMatchData.innings[newLiveMatchData.currentInnings - 1];
        if (updatedInnings.wickets >= 10) {
          setTimeout(() => {
            alert('10 wickets down! Click "End Innings" to proceed.');
          }, 100);
        } else {
          setTimeout(() => {
            alert("WICKET! Please select the new batsman from the 'On Strike' dropdown.");
          }, 100);
        }
      }
      // 2. Handle Odd Runs (and not a wicket)
      else if (isOddRun) {
        const temp = onStrikeBatsman;
        setOnStrikeBatsman(nonStrikeBatsman);
        setNonStrikeBatsman(temp);
      }

      // 3. Handle End of Over (only on legal balls)
      if (isLegalBall && newLiveMatchData.innings) {
        const newInningsData = newLiveMatchData.innings[newLiveMatchData.currentInnings - 1];
        const newOverNum = Math.floor(newInningsData.overs);

        if (newOverNum > lastOver) {
          setLastOver(newOverNum); // Update the over count
          
          // Swap strike (end of over rotation)
          const temp = onStrikeBatsman;
          setOnStrikeBatsman(nonStrikeBatsman);
          setNonStrikeBatsman(temp);
          
          setCurrentBowler("");
          
          setTimeout(() => {
            alert("OVER COMPLETE! Strike rotated. Please select a new bowler.");
          }, 100);
        }
      }
      // --- END STRIKE ROTATION LOGIC ---

    } catch (err) {
      console.error("❌ Error updating ball:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setScoringLoading(false);
    }
  };


  // --- ✅ UPDATED handleEndInnings WITH INNINGS DATA ---
const handleEndInnings = async () => {
  const currentInnings = liveMatchData.innings[liveMatchData.currentInnings - 1];
  const totalOvers = liveMatchData.totalOvers || 20;

  if (currentInnings.wickets >= 10 || currentInnings.overs >= totalOvers) {
    console.log(`✅ Innings ${liveMatchData.currentInnings} auto-complete triggered`);
  } else {
    const confirmEnd = window.confirm(
      `Are you sure you want to end this innings early?\n\n` +
        `Current: ${currentInnings.score}/${currentInnings.wickets} in ${currentInnings.overs} overs\n\n` +
        `Note: Innings not yet complete (less than ${totalOvers} overs or 10 wickets).`
    );
    if (!confirmEnd) return;
  }

  try {
    setScoringLoading(true);

    // ✅ NEW: Process ballByBall data to extract batsmen & bowlers
    const innings1 = liveMatchData.innings[0];
    const innings2 = liveMatchData.innings[1] || null;

    // ✅ Helper function to aggregate player stats from ballByBall
    const aggregateInningsStats = (innings) => {
      const batsmenMap = {};
      const bowlersMap = {};

      // Process each ball
      for (const ball of innings.ballByBall || []) {
        // Aggregate batsman stats
        if (ball.batsmanId) {
          if (!batsmenMap[ball.batsmanId]) {
            batsmenMap[ball.batsmanId] = {
              playerId: ball.batsmanId,
              playerName: ball.batsmanName || ball.batsman || "Unknown",
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              isOut: false
            };
          }
          
          batsmenMap[ball.batsmanId].runs += ball.runs || 0;
          
          // Count legal deliveries (not wides/no-balls)
          if (ball.extrasType !== "wide" && ball.extrasType !== "noBall") {
            batsmenMap[ball.batsmanId].balls += 1;
          }
          
          if (ball.runs === 4) batsmenMap[ball.batsmanId].fours += 1;
          if (ball.runs === 6) batsmenMap[ball.batsmanId].sixes += 1;
          if (ball.isWicket) batsmenMap[ball.batsmanId].isOut = true;
        }

        // Aggregate bowler stats
        if (ball.bowlerId) {
          if (!bowlersMap[ball.bowlerId]) {
            bowlersMap[ball.bowlerId] = {
              playerId: ball.bowlerId,
              playerName: ball.bowlerName || ball.bowler || "Unknown",
              wickets: 0,
              balls: 0,
              runs: 0,
              maidens: 0
            };
          }
          
          bowlersMap[ball.bowlerId].runs += (ball.runs || 0) + (ball.extras || 0);
          
          // Count legal deliveries
          if (ball.extrasType !== "wide" && ball.extrasType !== "noBall") {
            bowlersMap[ball.bowlerId].balls += 1;
          }
          
          if (ball.isWicket) bowlersMap[ball.bowlerId].wickets += 1;
        }
      }

      return {
        battingTeamId: innings.battingTeam?._id,
        bowlingTeamId: innings.bowlingTeam?._id,
        score: innings.score || 0,
        wickets: innings.wickets || 0,
        overs: innings.overs || 0,
        batsmen: Object.values(batsmenMap),
        bowlers: Object.values(bowlersMap),
        ballByBall: innings.ballByBall || []
      };
    };

    // ✅ Prepare innings data with player stats
    const inningsData = {
      innings: [aggregateInningsStats(innings1)]
    };

    // Add second innings if exists
    if (innings2) {
      inningsData.innings.push(aggregateInningsStats(innings2));
    }

    console.log("📤 Sending innings data with player stats:", inningsData);

    // ✅ First complete the innings
    const response = await fetch(
      `${BACKEND_URL}/api/v1/live-matches/${currentMatch._id}/complete-innings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to end innings");
    }

    const result = await response.json();
    console.log("✅ Innings ended:", result);

    // ✅ If this was the LAST innings (2nd innings), complete the match WITH innings data
    if (liveMatchData.currentInnings === 2) {
      console.log("🏆 Completing match with player stats...");
      
      const completeResponse = await fetch(
        `${BACKEND_URL}/api/v1/matches/${currentMatch._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Completed",
            ...inningsData, // ✅ Send innings data WITH batsmen/bowlers
          }),
        }
      );

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.message || "Failed to complete match");
      }

      const completeResult = await completeResponse.json();
      console.log("✅ Match completed with player stats:", completeResult);

      alert("🏆 Match completed! Player stats updated! Redirecting...");
      
      setTimeout(() => {
        handleBackToDashboard();
      }, 2000);
      
      return;
    }

    // Clear fields for next innings
    setOnStrikeBatsman("");
    setNonStrikeBatsman("");
    setCurrentBowler("");
    setBattingTeamPlayers([]);
    setBowlingTeamPlayers([]);
    setLastOver(0);
    setLastBalls([]);

    alert("✅ First innings ended! Starting second innings...");
    await fetchLiveMatchData();
    
  } catch (err) {
    console.error("❌ Error ending innings:", err);
    alert(`Error: ${err.message}`);
  } finally {
    setScoringLoading(false);
  }
};

  // This function stays inside as it depends on state
  const renderMatches = () => {
    if (loading) {
      return (
        <div style={styles.loadingSpinner}>
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

    if (matches.length === 0) {
      const emptyMessages = {
        live: { icon: "🏏", text: "No live matches at the moment" },
        upcoming: { icon: "📅", text: "No upcoming matches scheduled" },
        completed: { icon: "🏆", text: "No completed matches yet" },
      };
      const message = emptyMessages[activeTab];
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>{message.icon}</div>
          <p style={styles.emptyText}>{message.text}</p>
        </div>
      );
    }

    return matches.map((match) => (
      <div
        key={match._id}
        style={styles.matchCard}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#7c3aed";
          e.currentTarget.style.boxShadow =
            "0 10px 20px rgba(124, 58, 237, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e5e7eb";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={styles.matchHeader}>
          <h3 style={styles.matchTitle}>
            {match.teamA?.teamName || "Team A"} vs{" "}
            {match.teamB?.teamName || "Team B"}
          </h3>
          {getStatusBadge(match.status)}
        </div>

        <div style={styles.matchDetails}>
          <div style={styles.detailItem}>
            <Calendar size={18} color="#7c3aed" />
            <span>
              {formatDate(match.scheduledTime)},{" "}
              {formatTime(match.scheduledTime)}
            </span>
          </div>
          <div style={styles.detailItem}>
            <MapPin size={18} color="#7c3aed" />
            <span>{match.venue}</span>
          </div>
          <div style={styles.detailItem}>
            <Clock size={18} color="#7c3aed" />
            <span>
              {match.stage} - Round {match.round}
            </span>
          </div>
        </div>

        {(match.status === "InProgress" || match.status === "Completed") && (
          <div style={styles.scoreBox}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
                  {match.teamA?.teamName}
                </div>
                <div style={styles.score}>
                  {match.scoreA || 0}/{match.wicketsA || 0}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                  ({match.oversA || 0} ov)
                </div>
              </div>
              <div style={{ fontSize: "24px", color: "#9ca3af" }}>vs</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
                  {match.teamB?.teamName}
                </div>
                <div style={styles.score}>
                  {match.scoreB || 0}/{match.wicketsB || 0}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                  ({match.oversB || 0} ov)
                </div>
              </div>
            </div>
            {match.winner && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px",
                  background: "#dcfce7",
                  borderRadius: "6px",
                  textAlign: "center",
                  color: "#166534",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Trophy size={16} />
                Winner: {match.winner?.teamName || "TBD"}
              </div>
            )}
          </div>
        )}

        {match.status === "InProgress" && (
          <button
            style={styles.continueBtn}
            onClick={() => handleStartScoring(match)}
            onMouseEnter={(e) => (e.target.style.background = "#15803d")}
            onMouseLeave={(e) => (e.target.style.background = "#16a34a")}
          >
            <Play size={20} />
            Continue Scoring
          </button>
        )}
      </div>
    ));
  };

  // Call renderMatches to get the JSX
  const renderedMatchesComponent = renderMatches();

  return (
    <>
      <Header />
      <div style={styles.container}>
        <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.7; }
                    }
                    button:hover {
                        transform: translateY(-2px);
                    }
                    .match-card:hover {
                        border-color: #7c3aed !important;
                        box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3) !important;
                    }
                `}</style>

        {/* Custom Header for Scoring View */}
        {currentView === "scoring" && (
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <button
                style={styles.backBtn}
                onClick={handleBackToDashboard}
                onMouseEnter={(e) => (e.target.style.background = "#4f46e5")}
                onMouseLeave={(e) => (e.target.style.background = "#6366f1")}
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </button>

              <div style={styles.userInfo}>
                <User size={20} />
                <div>
                  <div style={styles.userLabel}>Scorer</div>
                  <div style={styles.userName}>{scorerName}</div>
                </div>
              </div>

              <button
                style={styles.logoutBtn}
                onClick={handleLogout}
                onMouseEnter={(e) => (e.target.style.background = "#b91c1c")}
                onMouseLeave={(e) => (e.target.style.background = "#dc2626")}
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Conditional Rendering */}
        {currentView === "dashboard" ? (
          <Dashboard
            scorerName={scorerName}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleCreateMatch={handleCreateMatch}
            handleStartScoring={handleStartScoring}
            handleViewStats={handleViewStats}
            matches={matches}
            renderedMatches={renderedMatchesComponent}
          />
        ) : (
          <ScoringInterface
            liveMatchData={liveMatchData}
            onStrikeBatsman={onStrikeBatsman}
            setOnStrikeBatsman={setOnStrikeBatsman}
            nonStrikeBatsman={nonStrikeBatsman}
            setNonStrikeBatsman={setNonStrikeBatsman}
            currentBowler={currentBowler}
            setCurrentBowler={setCurrentBowler}
            battingTeamPlayers={battingTeamPlayers}
            bowlingTeamPlayers={bowlingTeamPlayers}
            lastBalls={lastBalls}
            handleBallClick={handleBallClick}
            handleEndInnings={handleEndInnings}
            scoringLoading={scoringLoading}
          />
        )}
      </div>
      <Footer />
    </>
  );
}