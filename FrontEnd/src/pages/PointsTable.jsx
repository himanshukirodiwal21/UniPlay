import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Calendar,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/PointsTable.css";

const PointsTable = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... (Your useEffect logic remains exactly the same) ...
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
          : Array.isArray(data)
          ? data
          : [];

        console.log(`✅ Found ${allEvents.length} events`);
        setEvents(allEvents);

        if (allEvents.length > 0) {
          const latest = [...allEvents].sort(
            (a, b) =>
              new Date(b.createdAt || b.date || 0) -
              new Date(a.createdAt || a.date || 0)
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

        console.log(
          `📊 Calculating leaderboard for event: ${selectedEvent.name} (${selectedEvent._id})`
        );

        // Fetch all completed matches for this event
        const url = `http://localhost:8000/api/v1/matches?status=Completed&event=${selectedEvent._id}`;
        console.log("🔗 Request URL:", url);

        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Error response:", errorText);
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
              const liveResponse = await fetch(
                `http://localhost:8000/api/v1/live-matches/${match._id}`
              );
              const liveData = await liveResponse.json();

              if (liveData.success && liveData.data.innings) {
                const innings = liveData.data.innings;

                // Get scores for both teams from all innings
                const getTeamStats = (teamId) => {
                  let totalRuns = 0;
                  let totalOvers = 0;

                  innings.forEach((inning) => {
                    if (
                      inning.battingTeam?._id?.toString() === teamId?.toString()
                    ) {
                      totalRuns += inning.score || 0;
                      totalOvers += inning.overs || 0;
                    }
                  });

                  return { runs: totalRuns, overs: totalOvers };
                };

                const teamAStats = getTeamStats(match.teamA?._id);
                const teamBStats = getTeamStats(match.teamB?._id);

                console.log(
                  `Match ${match.teamA?.teamName} vs ${match.teamB?.teamName}:`,
                  {
                    teamA: teamAStats,
                    teamB: teamBStats,
                  }
                );

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
              console.error(
                `Error fetching live data for match ${match._id}:`,
                err
              );
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

        matchesWithScores.forEach((match) => {
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
              totalOversBowled: 0,
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
              totalOversBowled: 0,
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

          console.log(
            `Processing: ${teamA.teamName} ${scoreA}/${oversA} vs ${teamB.teamName} ${scoreB}/${oversB}`
          );

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
        Object.values(teamStats).forEach((team) => {
          const runRateFor =
            team.totalOversPlayed > 0
              ? team.totalRunsScored / team.totalOversPlayed
              : 0;
          const runRateAgainst =
            team.totalOversBowled > 0
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
            nrr: team.nrr.toFixed(3),
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

        console.log(
          `✅ Calculated leaderboard with ${leaderboardData.length} teams`
        );
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

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="rank-icon-gold" />;
    if (rank === 2) return <Award className="rank-icon-silver" />;
    if (rank === 3) return <Award className="rank-icon-bronze" />;
    return null;
  };

  const getNRRIcon = (nrr) => {
    if (nrr > 0) return <TrendingUp className="nrr-icon" />;
    if (nrr < 0) return <TrendingDown className="nrr-icon" />;
    return <Minus className="nrr-icon" />;
  };

  return (
    <>
      <Header />
      <div className="points-table-page">
        {/* Main Content */}
        <main className="main-content">
          {/* Event Selector Card */}
          <div className="card event-selector-card">
            <div className="event-selector-header">
              <Calendar className="event-selector-icon" />
              <label className="event-selector-label">Select Tournament</label>
            </div>
            <select
              onChange={(e) => {
                const selected = events.find((ev) => ev._id === e.target.value);
                console.log("🔄 Event changed to:", selected?.name);
                setSelectedEvent(selected);
              }}
              value={selectedEvent?._id || ""}
              className="event-select"
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
            <div className="card loading-card">
              <div className="loading-content">
                <div className="spinner"></div>
                <p className="loading-text">Loading tournament data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="error-card">
              <div className="error-content">
                <div className="error-icon-wrapper">
                  <span className="error-icon-text">!</span>
                </div>
                <div>
                  <h3 className="error-title">Error Loading Data</h3>
                  <p className="error-message">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* No Events */}
          {!loading && !error && !selectedEvent && events.length === 0 && (
            <div className="card empty-state-card">
              <div className="empty-state-content">
                <Trophy className="empty-state-icon" />
                <h3 className="empty-state-title">No Events Found</h3>
                <p className="empty-state-subtitle">
                  Create your first tournament to get started
                </p>
              </div>
            </div>
          )}

          {/* No Data for Event */}
          {!loading && !error && selectedEvent && leaderboard.length === 0 && (
            <div className="card empty-state-card">
              <div className="empty-state-content">
                <Trophy className="empty-state-icon" />
                <h3 className="empty-state-title">
                  No Data Yet for {selectedEvent.name}
                </h3>
                <p className="empty-state-subtitle">
                  The leaderboard will appear after matches are completed
                </p>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {!loading && !error && selectedEvent && leaderboard.length > 0 && (
            <div className="leaderboard-container">
              {/* Tournament Header */}
              <div className="leaderboard-header">
                <h2 className="leaderboard-title">{selectedEvent.name}</h2>
                <div className="leaderboard-subtitle">
                  <span>{leaderboard.length} Teams</span>
                </div>
              </div>

              {/* Table */}
              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <table className="leaderboard-table">
                    <thead>
                      <tr className="table-header-row">
                        <th className="table-header cell-rank">Rank</th>
                        <th className="table-header cell-team">Team</th>
                        <th className="table-header cell-center">M</th>
                        <th className="table-header cell-center">W</th>
                        <th className="table-header cell-center">L</th>
                        <th className="table-header cell-center">D</th>
                        <th className="table-header cell-center">NRR</th>
                        <th className="table-header cell-center">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {leaderboard.map((entry, index) => (
                        <tr
                          key={entry.team?._id || index}
                          className="table-body-row"
                        >
                          <td className="table-cell">
                            <div className="rank-cell-content">
                              {getRankIcon(index + 1)}
                              <span className="rank-text">{index + 1}</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span
                              onClick={() =>
                                navigate(`/team/${entry.team?._id}`)
                              }
                              className="team-name-link"
                            >
                              {entry.team?.teamName || "Unknown Team"}
                            </span>
                          </td>
                          <td className="table-cell cell-center">
                            {entry.matchesPlayed}
                          </td>
                          <td className="table-cell cell-center">
                            <span className="status-badge win">
                              {entry.wins}
                            </span>
                          </td>
                          <td className="table-cell cell-center">
                            <span className="status-badge loss">
                              {entry.losses}
                            </span>
                          </td>
                          <td className="table-cell cell-center">
                            <span className="status-badge draw">
                              {entry.draws}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="nrr-cell-content">
                              <span
                                className={`nrr-icon-wrapper ${
                                  entry.nrr > 0
                                    ? "nrr-positive"
                                    : entry.nrr < 0
                                    ? "nrr-negative"
                                    : "nrr-neutral"
                                }`}
                              >
                                {getNRRIcon(entry.nrr)}
                              </span>
                              <span
                                className={`nrr-text ${
                                  entry.nrr > 0
                                    ? "nrr-positive"
                                    : entry.nrr < 0
                                    ? "nrr-negative"
                                    : "nrr-neutral"
                                }`}
                              >
                                {entry.nrr > 0 ? "+" : ""}
                                {entry.nrr.toFixed(3)}
                              </span>
                            </div>
                          </td>
                          <td className="table-cell cell-center">
                            {entry.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Note */}
              <div className="table-footer-note">
                <div className="table-footer-legend">
                  <span>
                    <strong>M</strong> = Matches
                  </span>
                  <span>
                    <strong>W</strong> = Wins
                  </span>
                  <span>
                    <strong>L</strong> = Losses
                  </span>
                  <span>
                    <strong>D</strong> = Draws
                  </span>
                  <span>
                    <strong>NRR</strong> = Net Run Rate
                  </span>
                  <span>
                    <strong>Pts</strong> = Points
                  </span>
                </div>
                <div className="table-footer-live">
                  <div className="live-indicator"></div>
                  <span>Live Updates</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default PointsTable;
