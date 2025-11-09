// src/pages/PointsTable.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PointsTable = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🧩 STEP 1: Fetch all events on load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
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

        const allEvents = Array.isArray(data.data) 
          ? data.data 
          : (Array.isArray(data) ? data : []);

        console.log(`✅ Found ${allEvents.length} events`);
        setEvents(allEvents);

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

  // 🧩 STEP 2: Calculate leaderboard from completed matches
  useEffect(() => {
    if (!selectedEvent) {
      setLoading(false);
      return;
    }

    const calculateLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`📊 Calculating leaderboard for event: ${selectedEvent.name} (${selectedEvent._id})`);

        // Fetch all completed matches for this event
        const url = `http://localhost:8000/api/v1/matches?status=Completed&event=${selectedEvent._id}`;
        console.log('🔗 Request URL:', url);
        
        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Error response:', errorText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("📊 Fetched Completed Matches:", data);

        const completedMatches = data.data || [];
        console.log(`✅ Found ${completedMatches.length} completed matches`);

        // Fetch live data for each match to get accurate scores
        const matchesWithScores = await Promise.all(
          completedMatches.map(async (match) => {
            try {
              const liveResponse = await fetch(`http://localhost:8000/api/v1/live-matches/${match._id}`);
              const liveData = await liveResponse.json();
              
              if (liveData.success && liveData.data.innings) {
                const innings = liveData.data.innings;
                
                // Get scores for both teams from all innings
                const getTeamStats = (teamId) => {
                  let totalRuns = 0;
                  let totalOvers = 0;
                  
                  innings.forEach(inning => {
                    if (inning.battingTeam?._id?.toString() === teamId?.toString()) {
                      totalRuns += inning.score || 0;
                      totalOvers += inning.overs || 0;
                    }
                  });
                  
                  return { runs: totalRuns, overs: totalOvers };
                };

                const teamAStats = getTeamStats(match.teamA?._id);
                const teamBStats = getTeamStats(match.teamB?._id);

                console.log(`Match ${match.teamA?.teamName} vs ${match.teamB?.teamName}:`, {
                  teamA: teamAStats,
                  teamB: teamBStats
                });

                return {
                  ...match,
                  teamAScore: teamAStats.runs,
                  teamAOvers: teamAStats.overs,
                  teamBScore: teamBStats.runs,
                  teamBOvers: teamBStats.overs,
                };
              }
              
              // Fallback to match data if live data not available
              return {
                ...match,
                teamAScore: match.scoreA || 0,
                teamAOvers: match.oversA || 0,
                teamBScore: match.scoreB || 0,
                teamBOvers: match.oversB || 0,
              };
            } catch (err) {
              console.error(`Error fetching live data for match ${match._id}:`, err);
              return {
                ...match,
                teamAScore: match.scoreA || 0,
                teamAOvers: match.oversA || 0,
                teamBScore: match.scoreB || 0,
                teamBOvers: match.oversB || 0,
              };
            }
          })
        );

        // Calculate points for each team
        const teamStats = {};

        matchesWithScores.forEach(match => {
          const teamA = match.teamA;
          const teamB = match.teamB;
          const winner = match.winner;

          if (!teamA || !teamB) return;

          // Initialize team stats if not exists
          if (!teamStats[teamA._id]) {
            teamStats[teamA._id] = {
              team: teamA,
              matchesPlayed: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              points: 0,
              totalRunsScored: 0,
              totalOversPlayed: 0,
              totalRunsConceded: 0,
              totalOversBowled: 0
            };
          }

          if (!teamStats[teamB._id]) {
            teamStats[teamB._id] = {
              team: teamB,
              matchesPlayed: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              points: 0,
              totalRunsScored: 0,
              totalOversPlayed: 0,
              totalRunsConceded: 0,
              totalOversBowled: 0
            };
          }

          // Update matches played
          teamStats[teamA._id].matchesPlayed++;
          teamStats[teamB._id].matchesPlayed++;

          // Update run rate stats
          const scoreA = match.teamAScore || 0;
          const scoreB = match.teamBScore || 0;
          const oversA = match.teamAOvers || 0;
          const oversB = match.teamBOvers || 0;

          console.log(`Processing: ${teamA.teamName} ${scoreA}/${oversA} vs ${teamB.teamName} ${scoreB}/${oversB}`);

          // Team A stats
          teamStats[teamA._id].totalRunsScored += scoreA;
          teamStats[teamA._id].totalOversPlayed += oversA;
          teamStats[teamA._id].totalRunsConceded += scoreB;
          teamStats[teamA._id].totalOversBowled += oversB;

          // Team B stats
          teamStats[teamB._id].totalRunsScored += scoreB;
          teamStats[teamB._id].totalOversPlayed += oversB;
          teamStats[teamB._id].totalRunsConceded += scoreA;
          teamStats[teamB._id].totalOversBowled += oversA;

          // Determine result and update points
          if (winner) {
            if (winner._id === teamA._id) {
              // Team A won
              teamStats[teamA._id].wins++;
              teamStats[teamA._id].points += 2;
              teamStats[teamB._id].losses++;
              // No negative points for loss
            } else if (winner._id === teamB._id) {
              // Team B won
              teamStats[teamB._id].wins++;
              teamStats[teamB._id].points += 2;
              teamStats[teamA._id].losses++;
              // No negative points for loss
            }
          } else {
            // Draw/Tie
            teamStats[teamA._id].draws++;
            teamStats[teamA._id].points += 1;
            teamStats[teamB._id].draws++;
            teamStats[teamB._id].points += 1;
          }
        });

        // Calculate NRR for each team
        Object.values(teamStats).forEach(team => {
          const runRateFor = team.totalOversPlayed > 0 
            ? team.totalRunsScored / team.totalOversPlayed 
            : 0;
          const runRateAgainst = team.totalOversBowled > 0 
            ? team.totalRunsConceded / team.totalOversBowled 
            : 0;
          team.nrr = runRateFor - runRateAgainst;
          
          console.log(`${team.team.teamName} NRR:`, {
            runsScored: team.totalRunsScored,
            oversPlayed: team.totalOversPlayed,
            runsConceded: team.totalRunsConceded,
            oversBowled: team.totalOversBowled,
            runRateFor: runRateFor.toFixed(3),
            runRateAgainst: runRateAgainst.toFixed(3),
            nrr: team.nrr.toFixed(3)
          });
        });

        // Convert to array and sort by points (descending)
        const leaderboardData = Object.values(teamStats).sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          // If points are equal, sort by NRR
          if (Math.abs(b.nrr - a.nrr) > 0.001) {
            return b.nrr - a.nrr;
          }
          // If NRR is equal, sort by wins
          if (b.wins !== a.wins) {
            return b.wins - a.wins;
          }
          // If wins are equal, sort by matches played (fewer is better)
          return a.matchesPlayed - b.matchesPlayed;
        });

        console.log(`✅ Calculated leaderboard with ${leaderboardData.length} teams`);
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error("❌ Error calculating leaderboard:", err);
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    calculateLeaderboard();

    // Optional: refresh every 30s
    const interval = setInterval(calculateLeaderboard, 30000);
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
            
            {/* Points System Info */}

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
                    <th>NRR</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.team?._id || index}>
                      <td>
                        <strong>{index + 1}</strong>
                      </td>
                      <td>
                        <strong 
                          onClick={() => navigate(`/team/${entry.team?._id}`)}
                          style={{ 
                            cursor: "pointer", 
                            color: "#2563eb",
                            textDecoration: "underline"
                          }}
                        >
                          {entry.team?.teamName || "Unknown Team"}
                        </strong>
                      </td>
                      <td>{entry.matchesPlayed}</td>
                      <td style={{ color: "#16a34a", fontWeight: "600" }}>{entry.wins}</td>
                      <td style={{ color: "#dc2626", fontWeight: "600" }}>{entry.losses}</td>
                      <td style={{ color: "#2563eb", fontWeight: "600" }}>{entry.draws}</td>
                      <td style={{ 
                        color: entry.nrr > 0 ? "#16a34a" : entry.nrr < 0 ? "#dc2626" : "#6b7280",
                        fontWeight: "600"
                      }}>
                        {entry.nrr > 0 ? "+" : ""}{entry.nrr.toFixed(3)}
                      </td>
                      <td>
                        <strong style={{ 
                          color: entry.points > 0 ? "#16a34a" : entry.points < 0 ? "#dc2626" : "#6b7280",
                          fontSize: "1.1rem"
                        }}>
                          {entry.points > 0 ? "+" : ""}{entry.points}
                        </strong>
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