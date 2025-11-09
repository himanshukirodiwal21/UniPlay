// src/pages/TeamDetails.jsx
// This version builds team info from matches and doesn't require /teams/:id endpoint
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching data for team ID:", teamId);

      let teamInfo = null;
      let allMatches = [];

      // STRATEGY 1: Try fetching from teams endpoint
      try {
        console.log("📡 Trying: GET /api/v1/teams");
        const teamsRes = await fetch("http://localhost:8000/api/v1/teams");
        
        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          const teams = teamsData.data || teamsData || [];
          console.log(`✅ Found ${teams.length} teams`);
          
          teamInfo = teams.find(t => t._id === teamId);
          
          if (teamInfo) {
            console.log("✅ Team found in teams list:", teamInfo);
          } else {
            console.log("⚠️ Team not in teams list");
          }
        }
      } catch (err) {
        console.log("❌ Teams endpoint failed:", err.message);
      }

      // STRATEGY 2: Get team info from matches (MOST RELIABLE)
      try {
        console.log("📡 Fetching all matches...");
        const matchesRes = await fetch("http://localhost:8000/api/v1/matches");
        
        if (!matchesRes.ok) {
          throw new Error(`Matches API failed: ${matchesRes.status}`);
        }

        const matchesData = await matchesRes.json();
        allMatches = matchesData.data || matchesData || [];
        console.log(`✅ Found ${allMatches.length} total matches`);

        // Filter matches for this team
        const teamMatches = allMatches.filter(m => 
          m.teamA?._id === teamId || m.teamB?._id === teamId
        );
        
        console.log(`✅ Found ${teamMatches.length} matches for this team`);
        setMatches(teamMatches);

        // Extract team info from matches if not found yet
        if (!teamInfo && teamMatches.length > 0) {
          const firstMatch = teamMatches[0];
          teamInfo = firstMatch.teamA?._id === teamId 
            ? firstMatch.teamA 
            : firstMatch.teamB;
          
          console.log("✅ Extracted team info from matches:", teamInfo);
        }

        if (!teamInfo) {
          throw new Error("Team not found in any matches. The team may not have played any matches yet.");
        }

        setTeam(teamInfo);

        // Calculate stats
        await calculateTeamStats(teamInfo, teamMatches);

      } catch (err) {
        console.error("❌ Matches fetch failed:", err);
        throw err;
      }

      // STRATEGY 3: Fetch players
      try {
        console.log("📡 Fetching players...");
        const playersRes = await fetch("http://localhost:8000/api/v1/players");
        
        if (playersRes.ok) {
          const playersData = await playersRes.json();
          const allPlayers = playersData.data || playersData || [];
          
          // Filter players for this team
          const teamPlayers = allPlayers.filter(p => {
            // Check multiple possible field structures
            return p.team?._id === teamId || 
                   p.team === teamId ||
                   p.teamId === teamId;
          });
          
          console.log(`✅ Found ${teamPlayers.length} players for this team`);
          setPlayers(teamPlayers);
        }
      } catch (err) {
        console.log("⚠️ Could not fetch players:", err.message);
        setPlayers([]);
      }

    } catch (err) {
      console.error("❌ Fatal error:", err);
      setError(err.message || "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamStats = async (teamInfo, teamMatches) => {
    const stats = {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      totalRuns: 0,
      totalWickets: 0,
      highestScore: 0,
      lowestScore: Infinity,
      recentForm: [],
    };

    const completedMatches = teamMatches.filter(m => m.status === "Completed");
    stats.totalMatches = completedMatches.length;

    console.log(`📊 Processing ${completedMatches.length} completed matches`);

    for (const match of completedMatches) {
      const isTeamA = match.teamA?._id === teamId;
      const isTeamB = match.teamB?._id === teamId;
      
      if (!isTeamA && !isTeamB) continue;

      // Calculate runs
      let teamRuns = 0;
      
      // Try to get from live match data
      try {
        const liveRes = await fetch(`http://localhost:8000/api/v1/live-matches/${match._id}`);
        if (liveRes.ok) {
          const liveData = await liveRes.json();
          
          if (liveData.success && liveData.data?.innings) {
            const innings = liveData.data.innings;
            
            innings.forEach(inning => {
              const battingTeamId = inning.battingTeam?._id || inning.battingTeam;
              if (battingTeamId === teamId) {
                teamRuns += inning.score || 0;
              }
            });
          }
        }
      } catch (err) {
        // Fallback to match data
        teamRuns = isTeamA ? (match.scoreA || 0) : (match.scoreB || 0);
      }

      if (teamRuns === 0) {
        // Use basic match data as fallback
        teamRuns = isTeamA ? (match.scoreA || 0) : (match.scoreB || 0);
      }

      stats.totalRuns += teamRuns;
      if (teamRuns > stats.highestScore) stats.highestScore = teamRuns;
      if (teamRuns < stats.lowestScore && teamRuns > 0) stats.lowestScore = teamRuns;

      // Determine result
      if (match.winner) {
        const winnerId = match.winner._id || match.winner;
        if (winnerId === teamId) {
          stats.wins++;
          stats.recentForm.unshift("W");
        } else {
          stats.losses++;
          stats.recentForm.unshift("L");
        }
      } else {
        stats.draws++;
        stats.recentForm.unshift("D");
      }
    }

    stats.recentForm = stats.recentForm.slice(0, 5);
    if (stats.lowestScore === Infinity) stats.lowestScore = 0;

    console.log("📊 Final stats:", stats);
    setTeamStats(stats);
  };

  const getMatchResult = (match) => {
    if (!match.winner) return { result: "Draw", color: "#2563eb" };
    
    const winnerId = match.winner._id || match.winner;
    if (winnerId === teamId) {
      return { result: "Won", color: "#16a34a" };
    } else {
      return { result: "Lost", color: "#dc2626" };
    }
  };

  const getOpponent = (match) => {
    const isTeamA = match.teamA?._id === teamId;
    if (isTeamA) {
      return match.teamB?.teamName || match.teamB?.name || "Unknown Team";
    } else {
      return match.teamA?.teamName || match.teamA?.name || "Unknown Team";
    }
  };

  const getMatchScore = (match, isTeamA) => {
    if (isTeamA) {
      return {
        score: match.scoreA || 0,
        wickets: match.wicketsA || 0,
        overs: match.oversA || 0
      };
    } else {
      return {
        score: match.scoreB || 0,
        wickets: match.wicketsB || 0,
        overs: match.oversB || 0
      };
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container section">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <p style={{ fontSize: "1.5rem", color: "#6b7280" }}>Loading team details...</p>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginTop: "0.5rem" }}>
              Team ID: {teamId}
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !team) {
    return (
      <>
        <Header />
        <main className="container section">
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😕</div>
            <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>
              Team Not Found
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "0.5rem" }}>
              {error || "Could not load team data"}
            </p>
            <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "2rem" }}>
              Team ID: <code style={{ 
                backgroundColor: "#f3f4f6", 
                padding: "0.25rem 0.5rem",
                borderRadius: "4px"
              }}>{teamId}</code>
            </p>
            
            <div style={{ 
              backgroundColor: "#fef3c7", 
              border: "1px solid #fcd34d",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1.5rem",
              maxWidth: "500px",
              margin: "0 auto 1.5rem"
            }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#92400e" }}>
                💡 <strong>Tip:</strong> This team may not have played any matches yet.
                Teams appear here once they participate in completed matches.
              </p>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button 
                onClick={() => navigate("/points-table")}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500"
                }}
              >
                View Points Table
              </button>
              <button 
                onClick={() => navigate(-1)}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500"
                }}
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container section">
        {/* Header Section */}
        <div style={{ marginBottom: "2rem" }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "1rem",
              fontSize: "0.95rem"
            }}
          >
            ← Back
          </button>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "1.5rem",
            flexWrap: "wrap"
          }}>
            <h1 className="section-title" style={{ margin: 0 }}>
              🏏 {team.teamName || team.name || "Team Details"}
            </h1>
            
            {teamStats && teamStats.recentForm.length > 0 && (
              <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", color: "#6b7280", marginRight: "0.5rem" }}>
                  Recent Form:
                </span>
                {teamStats.recentForm.map((result, idx) => (
                  <span
                    key={idx}
                    title={result === "W" ? "Won" : result === "L" ? "Lost" : "Draw"}
                    style={{
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      backgroundColor: 
                        result === "W" ? "#dcfce7" :
                        result === "L" ? "#fee2e2" :
                        "#dbeafe",
                      color:
                        result === "W" ? "#16a34a" :
                        result === "L" ? "#dc2626" :
                        "#2563eb",
                      cursor: "help"
                    }}
                  >
                    {result}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div style={{ 
          borderBottom: "2px solid #e5e7eb", 
          marginBottom: "2rem",
          display: "flex",
          gap: "2rem"
        }}>
          {["overview", "players", "matches"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? "3px solid #2563eb" : "3px solid transparent",
                color: activeTab === tab ? "#2563eb" : "#6b7280",
                fontWeight: activeTab === tab ? "600" : "400",
                fontSize: "1rem",
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && teamStats && (
          <div>
            <h2 style={{ marginBottom: "1.5rem" }}>📊 Team Statistics</h2>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem"
            }}>
              <StatCard title="Total Matches" value={teamStats.totalMatches} icon="🏏" />
              <StatCard title="Wins" value={teamStats.wins} icon="🏆" color="#16a34a" />
              <StatCard title="Losses" value={teamStats.losses} icon="❌" color="#dc2626" />
              <StatCard title="Draws" value={teamStats.draws} icon="🤝" color="#2563eb" />
              <StatCard 
                title="Win Rate" 
                value={teamStats.totalMatches > 0 ? `${((teamStats.wins / teamStats.totalMatches) * 100).toFixed(1)}%` : "0%"} 
                icon="📈" 
                color="#8b5cf6" 
              />
              <StatCard title="Total Runs" value={teamStats.totalRuns} icon="🎯" />
              <StatCard title="Highest Score" value={teamStats.highestScore} icon="⬆️" color="#f59e0b" />
              <StatCard title="Lowest Score" value={teamStats.lowestScore} icon="⬇️" color="#ef4444" />
            </div>

            <div style={{
              backgroundColor: "#f9fafb",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #e5e7eb"
            }}>
              <h3 style={{ marginTop: 0 }}>Team Information</h3>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <InfoRow label="Team Name" value={team.teamName || team.name} />
                <InfoRow label="Captain" value={team.captain || "Not assigned"} />
                <InfoRow label="Total Players" value={players.length} />
                <InfoRow label="Matches Played" value={teamStats.totalMatches} />
              </div>
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === "players" && (
          <div>
            <h2 style={{ marginBottom: "1.5rem" }}>
              👥 Players ({players.length})
            </h2>
            
            {players.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "3rem",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👤</div>
                <p style={{ fontSize: "1.2rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                  No players found
                </p>
                <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
                  Players will appear here once they are added to the team
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="points-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player Name</th>
                      <th>Role</th>
                      <th>Jersey No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, idx) => (
                      <tr key={player._id}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{player.playerName || player.name || "Unknown"}</strong>
                        </td>
                        <td>
                          <span style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
                            backgroundColor: 
                              player.role === "Batsman" ? "#dbeafe" :
                              player.role === "Bowler" ? "#fef3c7" :
                              player.role === "All-rounder" ? "#dcfce7" :
                              player.role === "Wicket-keeper" ? "#fce7f3" :
                              "#f3f4f6",
                            color:
                              player.role === "Batsman" ? "#1e40af" :
                              player.role === "Bowler" ? "#92400e" :
                              player.role === "All-rounder" ? "#166534" :
                              player.role === "Wicket-keeper" ? "#9f1239" :
                              "#374151"
                          }}>
                            {player.role || "N/A"}
                          </span>
                        </td>
                        <td>{player.jerseyNumber || player.jerseyNo || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === "matches" && (
          <div>
            <h2 style={{ marginBottom: "1.5rem" }}>
              📋 Match History ({matches.filter(m => m.status === "Completed").length})
            </h2>
            
            {matches.filter(m => m.status === "Completed").length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "3rem",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏏</div>
                <p style={{ fontSize: "1.2rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                  No completed matches
                </p>
                <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
                  Match history will appear here after matches are completed
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {matches
                  .filter(m => m.status === "Completed")
                  .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
                  .map(match => {
                    const matchResult = getMatchResult(match);
                    const opponent = getOpponent(match);
                    const isTeamA = match.teamA?._id === teamId;
                    
                    return (
                      <div
                        key={match._id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "1.5rem",
                          backgroundColor: "#fff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}
                      >
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "1rem"
                        }}>
                          <div style={{ flex: 1, minWidth: "250px" }}>
                            <div style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "0.75rem",
                              marginBottom: "0.75rem"
                            }}>
                              <span style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "4px",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                backgroundColor: matchResult.result === "Won" ? "#dcfce7" :
                                  matchResult.result === "Lost" ? "#fee2e2" : "#dbeafe",
                                color: matchResult.color
                              }}>
                                {matchResult.result}
                              </span>
                              <span style={{ fontSize: "0.95rem", color: "#6b7280" }}>
                                vs <strong>{opponent}</strong>
                              </span>
                            </div>
                            
                            <div style={{ fontSize: "1.05rem", marginTop: "0.75rem" }}>
                              <div style={{ marginBottom: "0.35rem" }}>
                                <strong style={{ color: isTeamA ? "#2563eb" : "#6b7280" }}>
                                  {match.teamA?.teamName || "Team A"}:
                                </strong>{" "}
                                {getMatchScore(match, true).score}/{getMatchScore(match, true).wickets}
                                {getMatchScore(match, true).overs ? ` (${getMatchScore(match, true).overs} ov)` : ""}
                              </div>
                              <div>
                                <strong style={{ color: !isTeamA ? "#2563eb" : "#6b7280" }}>
                                  {match.teamB?.teamName || "Team B"}:
                                </strong>{" "}
                                {getMatchScore(match, false).score}/{getMatchScore(match, false).wickets}
                                {getMatchScore(match, false).overs ? ` (${getMatchScore(match, false).overs} ov)` : ""}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                              {match.event?.name || "Tournament"}
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                              {match.date ? new Date(match.date).toLocaleDateString() : "Date N/A"}
                            </div>
                            {match.venue && (
                              <div style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                                📍 {match.venue}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {match.result && (
                          <div style={{
                            marginTop: "1rem",
                            padding: "0.75rem",
                            backgroundColor: "#f9fafb",
                            borderRadius: "4px",
                            fontSize: "0.9rem",
                            color: "#4b5563"
                          }}>
                            {match.result}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, color = "#2563eb" }) => (
  <div style={{
    padding: "1.5rem",
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  }}>
    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
    <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.25rem" }}>
      {title}
    </div>
    <div style={{ fontSize: "1.75rem", fontWeight: "700", color }}>
      {value}
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>{label}:</span>
    <strong style={{ fontSize: "0.95rem" }}>{value}</strong>
  </div>
);

export default TeamDetails;