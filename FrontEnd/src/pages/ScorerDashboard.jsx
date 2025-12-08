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
  Upload,
  Pause,
  Square,
  Gauge,
} from "lucide-react";
import { io } from "socket.io-client";
import Footer from "../components/Footer";
import Header from "../components/Header";

const BACKEND_URL = "http://localhost:8000";
let socket = null;

// ✅ FIXED: Format overs properly (15.3 = 15 overs 3 balls)
const formatOvers = (overs) => {
  if (overs === 0 || overs === undefined || overs === null) return '0.0';
  
  // Backend sends in format: 15.3 (15 overs, 3 balls)
  const wholeOvers = Math.floor(overs);
  const decimalPart = overs - wholeOvers;
  const balls = Math.round(decimalPart * 10); // Extract decimal as balls
  
  // Safety check: if balls >= 6, it's a complete over
  if (balls >= 6) {
    return `${wholeOvers + 1}.0`;
  }
  
  return `${wholeOvers}.${balls}`;
};

// ✅ FIXED: Calculate overs left properly
const calculateOversLeft = (totalOvers, currentOvers) => {
  if (!currentOvers || currentOvers === 0) return `${totalOvers}.0`;
  
  const currentWholeOvers = Math.floor(currentOvers);
  const currentBalls = Math.round((currentOvers - currentWholeOvers) * 10);
  
  // Total balls in match
  const totalBalls = totalOvers * 6;
  const playedBalls = (currentWholeOvers * 6) + currentBalls;
  const remainingBalls = totalBalls - playedBalls;
  
  if (remainingBalls <= 0) return '0.0';
  
  // Convert back to overs.balls format
  const remainingOvers = Math.floor(remainingBalls / 6);
  const remainingBallsInOver = remainingBalls % 6;
  
  return `${remainingOvers}.${remainingBallsInOver}`;
};

// ✅ FIXED: Calculate run rate properly
const calculateRunRate = (score, overs) => {
  if (!overs || overs === 0) return '0.00';
  
  const wholeOvers = Math.floor(overs);
  const balls = Math.round((overs - wholeOvers) * 10);
  const totalBalls = (wholeOvers * 6) + balls;
  const totalOversDecimal = totalBalls / 6;
  
  return (score / totalOversDecimal).toFixed(2);
};

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
  playerInput: {
    width: "100%",
    padding: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "2px solid #e5e7eb",
    borderRadius: "6px",
    marginTop: "4px",
    background: "white",
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

// ✅ AutoPlay Control Panel Component
const AutoPlayControlPanel = ({
  uploadedFile,
  setUploadedFile,
  autoPlayStatus,
  handleFileUpload,
  handleStartAutoPlay,
  handlePauseAutoPlay,
  handleStopAutoPlay,
  handleSpeedChange,
}) => (
  <div
    style={{
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "24px",
      color: "white",
    }}
  >
    <h3
      style={{
        fontSize: "20px",
        fontWeight: "bold",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <Play size={24} />
      Auto-Play Control Panel
    </h3>

    <div
      style={{
        background: "rgba(255,255,255,0.1)",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      <label
        style={{
          display: "block",
          fontSize: "14px",
          marginBottom: "8px",
          fontWeight: "600",
        }}
      >
        📤 Upload Cricsheet JSON File
      </label>
      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "8px",
          border: "2px dashed rgba(255,255,255,0.5)",
          background: "rgba(255,255,255,0.1)",
          color: "white",
          cursor: "pointer",
        }}
      />
      {uploadedFile && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#d1fae5",
          }}
        >
          ✅ Uploaded: {uploadedFile}
        </div>
      )}
    </div>

    {uploadedFile && (
      <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={
              autoPlayStatus.isPlaying
                ? handlePauseAutoPlay
                : handleStartAutoPlay
            }
            disabled={!uploadedFile}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px",
              background: autoPlayStatus.isPlaying ? "#f59e0b" : "#10b981",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              cursor: uploadedFile ? "pointer" : "not-allowed",
              opacity: uploadedFile ? 1 : 0.5,
            }}
          >
            {autoPlayStatus.isPlaying ? (
              <>
                <Pause size={20} />
                Pause
              </>
            ) : (
              <>
                <Play size={20} />
                {autoPlayStatus.isPaused ? "Resume" : "Start"}
              </>
            )}
          </button>

          <button
            onClick={handleStopAutoPlay}
            disabled={!autoPlayStatus.isPlaying && !autoPlayStatus.isPaused}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px",
              background: "#ef4444",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              cursor:
                autoPlayStatus.isPlaying || autoPlayStatus.isPaused
                  ? "pointer"
                  : "not-allowed",
              opacity:
                autoPlayStatus.isPlaying || autoPlayStatus.isPaused ? 1 : 0.5,
            }}
          >
            <Square size={20} />
            Stop
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          >
            <Gauge size={20} />
            <select
              value={autoPlayStatus.speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                outline: "none",
                flex: 1,
              }}
            >
              <option value={0.5} style={{ color: "black" }}>
                0.5x
              </option>
              <option value={1} style={{ color: "black" }}>
                1x
              </option>
              <option value={2} style={{ color: "black" }}>
                2x
              </option>
              <option value={3} style={{ color: "black" }}>
                3x
              </option>
            </select>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              fontSize: "14px",
            }}
          >
            <span>
              Progress: {autoPlayStatus.currentBall} /{" "}
              {autoPlayStatus.totalBalls}
            </span>
            <span>{autoPlayStatus.progress.toFixed(1)}%</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${autoPlayStatus.progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #10b981, #34d399)",
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
      </>
    )}
  </div>
);

// ✅ ScoringInterface component
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
  autoPlayMode,
  uploadedFile,
  setUploadedFile,
  autoPlayStatus,
  handleFileUpload,
  handleStartAutoPlay,
  handlePauseAutoPlay,
  handleStopAutoPlay,
  handleSpeedChange,
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

  const getBatsmanOptions = (isStrike) => {
    const otherBatsmanId = isStrike ? nonStrikeBatsman : onStrikeBatsman;
    return battingTeamPlayers
      .filter((p) => p._id !== otherBatsmanId)
      .map((player) => (
        <option key={player._id} value={player._id}>
          {player.name}
        </option>
      ));
  };

  const getBowlerOptions = () => {
    return bowlingTeamPlayers.map((player) => (
      <option key={player._id} value={player._id}>
        {player.name}
      </option>
    ));
  };

  return (
    <div style={styles.mainContent}>
      {autoPlayMode && (
        <AutoPlayControlPanel
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          autoPlayStatus={autoPlayStatus}
          handleFileUpload={handleFileUpload}
          handleStartAutoPlay={handleStartAutoPlay}
          handlePauseAutoPlay={handlePauseAutoPlay}
          handleStopAutoPlay={handleStopAutoPlay}
          handleSpeedChange={handleSpeedChange}
        />
      )}

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
          {autoPlayMode && (
            <div
              style={{
                marginTop: "8px",
                padding: "6px 12px",
                background: "#6366f1",
                color: "white",
                borderRadius: "8px",
                display: "inline-block",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              🤖 Auto-Play Mode
            </div>
          )}
        </div>

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

        {/* ✅ FIXED: Score Display with proper formatting */}
        <div style={styles.scoreDisplay}>
          <div style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#6b7280",
          }}>
            {currentInnings.battingTeam?.teamName || "Batting Team"} - Innings{" "}
            {liveMatchData.currentInnings}
          </div>
          <div style={styles.scoreLarge}>
            {currentInnings.score}/{currentInnings.wickets}
          </div>
          <div style={{ color: "#6b7280", fontSize: "16px", marginBottom: "4px" }}>
            {/* ✅ FIXED: Proper overs display */}
            {formatOvers(currentInnings.overs)} / {totalOvers}.0 overs
          </div>
          <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>
            {/* ✅ FIXED: Accurate run rate */}
            Run Rate: {calculateRunRate(currentInnings.score, currentInnings.overs)} • 
            Overs Left: {calculateOversLeft(totalOvers, currentInnings.overs)}
          </div>
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
              ? "⚠️ Innings Complete"
              : `Wickets Remaining: ${10 - currentInnings.wickets}/10`}
          </div>
        </div>

        {(!autoPlayMode || !autoPlayStatus.isPlaying) && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <div style={styles.playerBox}>
                <div style={styles.playerLabel}>🏏 On-Strike Batsman</div>
                <select
                  style={styles.playerInput}
                  value={onStrikeBatsman}
                  onChange={(e) => setOnStrikeBatsman(e.target.value)}
                  disabled={
                    isInningsComplete || battingTeamPlayers.length === 0
                  }
                >
                  <option value="">-- Select On-Strike --</option>
                  {getBatsmanOptions(true)}
                </select>
              </div>

              <div style={styles.playerBox}>
                <div style={styles.playerLabel}>🏃 Non-Strike Batsman</div>
                <select
                  style={styles.playerInput}
                  value={nonStrikeBatsman}
                  onChange={(e) => setNonStrikeBatsman(e.target.value)}
                  disabled={
                    isInningsComplete || battingTeamPlayers.length === 0
                  }
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
                  disabled={
                    isInningsComplete || bowlingTeamPlayers.length === 0
                  }
                >
                  <option value="">-- Select Bowler --</option>
                  {getBowlerOptions()}
                </select>
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
          </>
        )}

        {autoPlayMode && autoPlayStatus.isPlaying && (
          <div
            style={{
              background: "#e0e7ff",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              color: "#4f46e5",
              fontWeight: "600",
              marginBottom: "20px",
            }}
          >
            🤖 Auto-play is running... Balls are being played automatically at{" "}
            {autoPlayStatus.speed}x speed
          </div>
        )}

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

// ✅ Dashboard component
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

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [liveMatchData, setLiveMatchData] = useState(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  const [onStrikeBatsman, setOnStrikeBatsman] = useState("");
  const [nonStrikeBatsman, setNonStrikeBatsman] = useState("");
  const [currentBowler, setCurrentBowler] = useState("");
  const [battingTeamPlayers, setBattingTeamPlayers] = useState([]);
  const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState([]);
  const [lastOver, setLastOver] = useState(0);
  const [lastBalls, setLastBalls] = useState([]);

  const [autoPlayMode, setAutoPlayMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [autoPlayStatus, setAutoPlayStatus] = useState({
    isPlaying: false,
    isPaused: false,
    currentBall: 0,
    totalBalls: 0,
    speed: 1,
    progress: 0,
  });

  useEffect(() => {
    if (currentView === "dashboard") {
      fetchMatches();
    }
  }, [activeTab, currentView]);

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

  useEffect(() => {
    if (currentMatch && currentView === "scoring") {
      fetchLiveMatchData();
    }
  }, [currentMatch, currentView]);

  useEffect(() => {
    if (autoPlayMode && autoPlayStatus.isPlaying && currentMatch) {
      const interval = setInterval(() => {
        fetchAutoPlayStatus();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [autoPlayMode, autoPlayStatus.isPlaying, currentMatch]);

  const fetchAutoPlayStatus = async () => {
    if (!currentMatch) return;
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/auto-play/${currentMatch._id}/status`
      );
      if (response.ok) {
        const data = await response.json();
        setAutoPlayStatus(data.data);
      }
    } catch (err) {
      console.error("Status fetch error:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      alert("Please upload a JSON file");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);

          const response = await fetch(
            `${BACKEND_URL}/api/v1/auto-play/${currentMatch._id}/upload`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(jsonData),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }

          const result = await response.json();
          setUploadedFile(file.name);
          alert(`✅ File uploaded successfully!
        
Total Innings: ${result.data.totalInnings}
Total Balls: ${result.data.totalBalls}
Players Found: ${result.data.playersFound}`);

          fetchAutoPlayStatus();
        } catch (err) {
          console.error("Upload error:", err);
          alert(`Error: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      alert("Error reading file");
    }
  };

  const handleStartAutoPlay = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/auto-play/${currentMatch._id}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ speed: autoPlayStatus.speed }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert("▶️ Auto-play started!");
      fetchAutoPlayStatus();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handlePauseAutoPlay = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/auto-play/${currentMatch._id}/pause`, {
        method: "POST",
      });
      fetchAutoPlayStatus();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleStopAutoPlay = async () => {
    if (!confirm("Stop and reset auto-play?")) return;

    try {
      await fetch(`${BACKEND_URL}/api/v1/auto-play/${currentMatch._id}/stop`, {
        method: "POST",
      });
      fetchAutoPlayStatus();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSpeedChange = async (newSpeed) => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/auto-play/${currentMatch._id}/speed`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ speed: newSpeed }),
      });
      fetchAutoPlayStatus();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const fetchTeamPlayers = async (battingTeamId, bowlingTeamId) => {
    if (!battingTeamId || !bowlingTeamId) return;
    try {
      const batResponse = await fetch(
        `${BACKEND_URL}/api/v1/team-registrations/${battingTeamId}`
      );
      if (!batResponse.ok) throw new Error("Failed to fetch batting team");
      const batData = await batResponse.json();

      const battingPlayers = (batData.data.players || []).map((teamPlayer) => ({
        _id: teamPlayer.playerId || teamPlayer._id,
        name: teamPlayer.name,
        role: teamPlayer.role,
        isLinked: !!teamPlayer.playerId,
      }));

      setBattingTeamPlayers(battingPlayers);

      const bowlResponse = await fetch(
        `${BACKEND_URL}/api/v1/team-registrations/${bowlingTeamId}`
      );
      if (!bowlResponse.ok) throw new Error("Failed to fetch bowling team");
      const bowlData = await bowlResponse.json();

      const bowlingPlayers = (bowlData.data.players || []).map(
        (teamPlayer) => ({
          _id: teamPlayer.playerId || teamPlayer._id,
          name: teamPlayer.name,
          role: teamPlayer.role,
          isLinked: !!teamPlayer.playerId,
        })
      );

      setBowlingTeamPlayers(bowlingPlayers);
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

      if (
        (activeTab === "live" || activeTab === "completed") &&
        data.data?.length > 0
      ) {
        const matchesWithLiveData = await Promise.all(
          data.data.map(async (match) => {
            try {
              const liveResponse = await fetch(
                `${BACKEND_URL}/api/v1/live-matches/${match._id}`
              );
              const liveData = await liveResponse.json();

              if (liveData.success && liveData.data.innings) {
                const innings = liveData.data.innings;

                const getTeamScore = (teamId) => {
                  const currentInnings =
                    innings[liveData.data.currentInnings - 1];
                  if (
                    currentInnings?.battingTeam?._id?.toString() ===
                    teamId?.toString()
                  ) {
                    return {
                      score: currentInnings.score || 0,
                      wickets: currentInnings.wickets || 0,
                      overs: currentInnings.overs || 0,
                    };
                  }

                  if (
                    innings[0]?.battingTeam?._id?.toString() ===
                    teamId?.toString()
                  ) {
                    return {
                      score: innings[0].score || 0,
                      wickets: innings[0].wickets || 0,
                      overs: innings[0].overs || 0,
                    };
                  }

                  if (
                    innings[1]?.battingTeam?._id?.toString() ===
                    teamId?.toString()
                  ) {
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
              console.error(
                `Error fetching live data for match ${match._id}:`,
                err
              );
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

      if (
        data.data.innings &&
        (battingTeamPlayers.length === 0 || bowlingTeamPlayers.length === 0)
      ) {
        const currentInnings =
          data.data.innings[data.data.currentInnings - 1];
        const battingTeamId = currentInnings.battingTeam?._id;
        const bowlingTeamId = currentInnings.bowlingTeam?._id;

        if (battingTeamId && bowlingTeamId) {
          await fetchTeamPlayers(battingTeamId, bowlingTeamId);
          setLastOver(Math.floor(currentInnings.overs || 0));
        }
      }

      const currentInnings = data.data.innings[data.data.currentInnings - 1];
      if (currentInnings && currentInnings.ballByBall) {
        const recent = currentInnings.ballByBall.slice(-6).reverse();
        setLastBalls(
          recent.map((b) => (b.runs === 0 && b.isWicket ? "W" : b.runs.toString()))
        );
      }
      return data.data;
    } catch (err) {
      console.error("❌ Error fetching live match:", err);
      return null;
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

  const handleStartScoring = async (match = null, mode = "manual") => {
    const matchToScore =
      match ||
      matches.find((m) => m.status === "InProgress") ||
      matches[0];

    if (!matchToScore) {
      alert("No match available to score.");
      return;
    }

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
    setAutoPlayMode(mode === "auto");
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
          tossWinner: match.teamA._id,
          choice: "bat",
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

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setCurrentMatch(null);
    setLiveMatchData(null);
    setOnStrikeBatsman("");
    setNonStrikeBatsman("");
    setCurrentBowler("");
    setBattingTeamPlayers([]);
    setBowlingTeamPlayers([]);
    setLastOver(0);
    setLastBalls([]);
    setAutoPlayMode(false);
    setUploadedFile(null);
    setAutoPlayStatus({
      isPlaying: false,
      isPaused: false,
      currentBall: 0,
      totalBalls: 0,
      speed: 1,
      progress: 0,
    });
  };

  const handleViewStats = () => {
    alert("Opening statistics dashboard...");
  };

  const handleBallClick = async (value) => {
    if (!onStrikeBatsman || !nonStrikeBatsman || !currentBowler) {
      alert(
        "Please select On-Strike Batsman, Non-Strike Batsman, and Current Bowler first!"
      );
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
      const battingTeamId = currentInnings.battingTeam?._id;
      const bowlingTeamId = currentInnings.bowlingTeam?._id;
      const batsmanName = battingTeamPlayers.find(
        (p) => p._id === onStrikeBatsman
      )?.name;
      const bowlerName = bowlingTeamPlayers.find(
        (p) => p._id === currentBowler
      )?.name;

      let ballData = {
        batsmanId: onStrikeBatsman,
        bowlerId: currentBowler,
        battingTeamId: battingTeamId,
        bowlingTeamId: bowlingTeamId,
        batsmanName: batsmanName,
        bowlerName: bowlerName,
        runs: 0,
        extras: 0,
        extrasType: "none",
        isWicket: false,
        wicketType: "none",
        commentary: "",
      };

      if (value === "W") {
        ballData.isWicket = true;
        ballData.wicketType = "caught";
        ballData.commentary = `WICKET! ${batsmanName || "Batsman"} is out!`;
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

      const newLiveMatchData = await fetchLiveMatchData();
      setLastBalls([value, ...lastBalls.slice(0, 5)]);

      if (!newLiveMatchData) return;

      const runs = parseInt(value);
      const isOddRun = [1, 3, 5].includes(runs);
      const isLegalBall = value !== "WD" && value !== "NB";

      if (value === "W") {
        setOnStrikeBatsman("");

        const updatedInnings =
          newLiveMatchData.innings[newLiveMatchData.currentInnings - 1];
        if (updatedInnings.wickets >= 10) {
          setTimeout(() => {
            alert('10 wickets down! Click "End Innings" to proceed.');
          }, 100);
        } else {
          setTimeout(() => {
            alert(
              "WICKET! Please select the new batsman from the 'On Strike' dropdown."
            );
          }, 100);
        }
      } else if (isOddRun) {
        const temp = onStrikeBatsman;
        setOnStrikeBatsman(nonStrikeBatsman);
        setNonStrikeBatsman(temp);
      }

      if (isLegalBall && newLiveMatchData.innings) {
        const newInningsData =
          newLiveMatchData.innings[newLiveMatchData.currentInnings - 1];
        const newOverNum = Math.floor(newInningsData.overs);

        if (newOverNum > lastOver) {
          setLastOver(newOverNum);

          const temp = onStrikeBatsman;
          setOnStrikeBatsman(nonStrikeBatsman);
          setNonStrikeBatsman(temp);

          setCurrentBowler("");

          setTimeout(() => {
            alert(
              "OVER COMPLETE! Strike rotated. Please select a new bowler."
            );
          }, 100);
        }
      }
    } catch (err) {
      console.error("❌ Error updating ball:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setScoringLoading(false);
    }
  };

  const handleEndInnings = async () => {
    const currentInnings =
      liveMatchData.innings[liveMatchData.currentInnings - 1];
    const totalOvers = liveMatchData.totalOvers || 20;

    if (currentInnings.wickets >= 10 || currentInnings.overs >= totalOvers) {
      console.log(
        `✅ Innings ${liveMatchData.currentInnings} auto-complete triggered`
      );
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

      const innings1 = liveMatchData.innings[0];
      const innings2 = liveMatchData.innings[1] || null;

      const aggregateInningsStats = (innings) => {
        const batsmenMap = {};
        const bowlersMap = {};

        for (const ball of innings.ballByBall || []) {
          if (ball.batsmanId) {
            if (!batsmenMap[ball.batsmanId]) {
              batsmenMap[ball.batsmanId] = {
                playerId: ball.batsmanId,
                playerName: ball.batsmanName || ball.batsman || "Unknown",
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                isOut: false,
              };
            }

            batsmenMap[ball.batsmanId].runs += ball.runs || 0;

            if (
              ball.extrasType !== "wide" &&
              ball.extrasType !== "noBall"
            ) {
              batsmenMap[ball.batsmanId].balls += 1;
            }

            if (ball.runs === 4) batsmenMap[ball.batsmanId].fours += 1;
            if (ball.runs === 6) batsmenMap[ball.batsmanId].sixes += 1;
            if (ball.isWicket) batsmenMap[ball.batsmanId].isOut = true;
          }

          if (ball.bowlerId) {
            if (!bowlersMap[ball.bowlerId]) {
              bowlersMap[ball.bowlerId] = {
                playerId: ball.bowlerId,
                playerName: ball.bowlerName || ball.bowler || "Unknown",
                wickets: 0,
                balls: 0,
                runs: 0,
                maidens: 0,
              };
            }

            bowlersMap[ball.bowlerId].runs +=
              (ball.runs || 0) + (ball.extras || 0);

            if (
              ball.extrasType !== "wide" &&
              ball.extrasType !== "noBall"
            ) {
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
          ballByBall: innings.ballByBall || [],
        };
      };

      const inningsData = {
        innings: [aggregateInningsStats(innings1)],
      };

      if (innings2) {
        inningsData.innings.push(aggregateInningsStats(innings2));
      }

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
              ...inningsData,
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

        {/* ✅ FIXED: Match score display with proper overs format */}
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
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  {match.teamA?.teamName}
                </div>
                <div style={styles.score}>
                  {match.scoreA || 0}/{match.wicketsA || 0}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                  {/* ✅ FIXED: Proper overs format */}
                  ({formatOvers(match.oversA || 0)} ov)
                </div>
              </div>
              <div style={{ fontSize: "24px", color: "#9ca3af" }}>vs</div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  {match.teamB?.teamName}
                </div>
                <div style={styles.score}>
                  {match.scoreB || 0}/{match.wicketsB || 0}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                  {/* ✅ FIXED: Proper overs format */}
                  ({formatOvers(match.oversB || 0)} ov)
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <button
              style={styles.continueBtn}
              onClick={() => handleStartScoring(match, "manual")}
              onMouseEnter={(e) => (e.target.style.background = "#15803d")}
              onMouseLeave={(e) => (e.target.style.background = "#16a34a")}
            >
              <Play size={20} />
              Manual Scoring
            </button>
            <button
              style={{
                ...styles.continueBtn,
                background: "#6366f1",
              }}
              onClick={() => handleStartScoring(match, "auto")}
              onMouseEnter={(e) => (e.target.style.background = "#4f46e5")}
              onMouseLeave={(e) => (e.target.style.background = "#6366f1")}
            >
              <Upload size={20} />
              Auto-Play Mode
            </button>
          </div>
        )}
      </div>
    ));
  };

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
        `}</style>

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
            autoPlayMode={autoPlayMode}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            autoPlayStatus={autoPlayStatus}
            handleFileUpload={handleFileUpload}
            handleStartAutoPlay={handleStartAutoPlay}
            handlePauseAutoPlay={handlePauseAutoPlay}
            handleStopAutoPlay={handleStopAutoPlay}
            handleSpeedChange={handleSpeedChange}
          />
        )}
      </div>
      <Footer />
    </>
  );
}