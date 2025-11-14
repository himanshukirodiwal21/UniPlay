import React, { useEffect, useState, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../assets/HomePage.css"; // Make sure this path is correct

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [selectedLeaderboardEvent, setSelectedLeaderboardEvent] =
    useState(null);
  const [allEventsForLeaderboard, setAllEventsForLeaderboard] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if returning from another page
    const savedPosition = sessionStorage.getItem("homePageScrollPosition");

    if (
      savedPosition &&
      (location.state?.fromEventDetails || location.state?.fromEventsPage)
    ) {
      // Restore scroll position after content loads
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedPosition), behavior: "instant" });
      }, 100);
    } else {
      // New visit - scroll to top
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    fetchEvents();
    fetchMatches();
    fetchLeaderboard();

    // Save scroll position before unmounting
    return () => {
      sessionStorage.setItem(
        "homePageScrollPosition",
        window.scrollY.toString()
      );
    };
  }, [location.state]);

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(
        "homePageScrollPosition",
        window.scrollY.toString()
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoadingMatches(true);
      const res = await fetch("http://localhost:8000/api/v1/matches");
      const data = await res.json();
      setMatches(data.data || []);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  const fetchLeaderboard = async (eventToUse = null) => {
    try {
      setLoadingLeaderboard(true);
      let eventToProcess = eventToUse;
      let matchesForEvent = [];

      // If no event provided, find the latest one with completed matches
      if (!eventToProcess) {
        const eventsRes = await fetch("http://localhost:8000/api/v1/events");
        if (!eventsRes.ok) throw new Error("Failed to fetch events");
        const eventsData = await eventsRes.json();

        const allEvents = Array.isArray(eventsData.data)
          ? eventsData.data
          : Array.isArray(eventsData)
          ? eventsData
          : [];

        if (allEvents.length === 0) {
          setLeaderboard([]);
          setLoadingLeaderboard(false);
          return;
        }

        const approvedEvents = allEvents.filter((e) => e.status === "approved");
        setAllEventsForLeaderboard(approvedEvents);

        const sortedEvents = [...approvedEvents].sort(
          (a, b) =>
            new Date(b.createdAt || b.date || 0) -
            new Date(a.createdAt || a.date || 0)
        );

        for (const event of sortedEvents) {
          const matchesRes = await fetch(
            `http://localhost:8000/api/v1/matches?status=Completed&event=${event._id}`
          );

          if (matchesRes.ok) {
            const matchesData = await matchesRes.json();
            const completedMatches = matchesData.data || [];

            if (completedMatches.length > 0) {
              eventToProcess = event;
              matchesForEvent = completedMatches; // Store matches to avoid re-fetch
              break;
            }
          }
        }

        if (!eventToProcess) {
          setLeaderboard([]);
          setLoadingLeaderboard(false);
          return;
        }
        setSelectedLeaderboardEvent(eventToProcess);
      }

      // If we're processing a specific event, we still need its matches
      if (matchesForEvent.length === 0 && eventToProcess) {
        const matchesRes = await fetch(
          `http://localhost:8000/api/v1/matches?status=Completed&event=${eventToProcess._id}`
        );
        if (!matchesRes.ok) {
          setLeaderboard([]);
          setLoadingLeaderboard(false);
          return;
        }
        const matchesData = await matchesRes.json();
        matchesForEvent = matchesData.data || [];
      }

      if (matchesForEvent.length === 0) {
        setLeaderboard([]);
        setLoadingLeaderboard(false);
        return;
      }

      const matchesWithScores = await Promise.all(
        matchesForEvent.map(async (match) => {
          try {
            const liveResponse = await fetch(
              `http://localhost:8000/api/v1/live-matches/${match._id}`
            );
            const liveData = await liveResponse.json();

            if (liveData.success && liveData.data.innings) {
              const innings = liveData.data.innings;
              const getTeamStats = (teamId) => {
                let totalRuns = 0,
                  totalOvers = 0;
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
              return {
                ...match,
                teamAScore: teamAStats.runs,
                teamAOvers: teamAStats.overs,
                teamBScore: teamBStats.runs,
                teamBOvers: teamBStats.overs,
              };
            }
            return {
              ...match,
              teamAScore: match.scoreA || 0,
              teamAOvers: match.oversA || 0,
              teamBScore: match.scoreB || 0,
              teamBOvers: match.oversB || 0,
            };
          } catch {
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

      const teamStats = {};
      matchesWithScores.forEach((match) => {
        const {
          teamA,
          teamB,
          winner,
          teamAScore,
          teamAOvers,
          teamBScore,
          teamBOvers,
        } = match;
        if (!teamA || !teamB) return;
        if (!teamStats[teamA._id])
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
        if (!teamStats[teamB._id])
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
        teamStats[teamA._id].matchesPlayed++;
        teamStats[teamB._id].matchesPlayed++;
        teamStats[teamA._id].totalRunsScored += teamAScore || 0;
        teamStats[teamA._id].totalOversPlayed += teamAOvers || 0;
        teamStats[teamA._id].totalRunsConceded += teamBScore || 0;
        teamStats[teamA._id].totalOversBowled += teamBOvers || 0;
        teamStats[teamB._id].totalRunsScored += teamBScore || 0;
        teamStats[teamB._id].totalOversPlayed += teamBOvers || 0;
        teamStats[teamB._id].totalRunsConceded += teamAScore || 0;
        teamStats[teamB._id].totalOversBowled += teamAOvers || 0;
        if (winner) {
          if (winner._id === teamA._id) {
            teamStats[teamA._id].wins++;
            teamStats[teamA._id].points += 2;
            teamStats[teamB._id].losses++;
          } else if (winner._id === teamB._id) {
            teamStats[teamB._id].wins++;
            teamStats[teamB._id].points += 2;
            teamStats[teamA._id].losses++;
          }
        } else {
          teamStats[teamA._id].draws++;
          teamStats[teamA._id].points += 1;
          teamStats[teamB._id].draws++;
          teamStats[teamB._id].points += 1;
        }
      });

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
      });

      const leaderboardData = Object.values(teamStats)
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (Math.abs(b.nrr - a.nrr) > 0.001) return b.nrr - a.nrr;
          if (b.wins !== a.wins) return b.wins - a.wins;
          return a.matchesPlayed - b.matchesPlayed;
        })
        .slice(0, 5);

      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setLeaderboard([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleViewDetails = (event) => {
    sessionStorage.setItem("homePageScrollPosition", window.scrollY.toString());
    navigate(`/event/${event._id}`, { state: { event, fromHomePage: true } });
  };

  const handleMatchClick = (match) => {
    sessionStorage.setItem("homePageScrollPosition", window.scrollY.toString());
    if (match.status === "InProgress") {
      navigate(`/live-match/${match._id}`, { state: { fromHomePage: true } });
    } else if (match.status === "Completed") {
      navigate(`/match-result/${match._id}`, { state: { fromHomePage: true } });
    } else {
      navigate(`/match/${match._id}`, { state: { fromHomePage: true } });
    }
  };

  const handleViewAllEvents = () => {
    sessionStorage.setItem("homePageScrollPosition", window.scrollY.toString());
    navigate("/events", { state: { fromHomePage: true } });
  };

  const handleLeaderboardEventChange = (eventId) => {
    const selected = allEventsForLeaderboard.find((e) => e._id === eventId);
    if (selected) {
      setSelectedLeaderboardEvent(selected);
      fetchLeaderboard(selected);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const approvedEvents = useMemo(
    () => events.filter((e) => e.status === "approved"),
    [events]
  );

  const liveMatches = useMemo(
    () => matches.filter((m) => m.status === "InProgress"),
    [matches]
  );

  const completedMatches = useMemo(
    () => matches.filter((m) => m.status === "Completed"),
    [matches]
  );

  const upcomingMatches = useMemo(
    () => matches.filter((m) => m.status === "Scheduled").slice(0, 3),
    [matches]
  );

  const recentMatches = useMemo(
    () => completedMatches.slice(0, 2),
    [completedMatches]
  );

  const displayMatches = useMemo(() => {
    const featured = [...liveMatches];
    if (featured.length < 4) {
      const needed = 4 - featured.length;
      featured.push(...completedMatches.slice(0, needed));
    }
    return featured.slice(0, 4);
  }, [liveMatches, completedMatches]);

  return (
    <>
      <Header />

      <main className="modern-main">
        {/* Hero Section */}
        <section className="hero-banner">
          <div className="hero-background"></div>
          <div className="container hero-container">
            <div className="hero-text">
              <span className="hero-tag">🏆 University Sports Hub</span>
              <h1 className="hero-heading">
                Ignite the Rivalry.{" "}
                <span className="highlight">Unite the Campus.</span>
              </h1>
              <p className="hero-description">
                Your ultimate destination for university sports, tournaments,
                and team glory. Compete, connect, and conquer together!
              </p>
              <div className="hero-actions">
                <a href="#live" className="btn-hero-primary">
                  <i className="fas fa-bolt"></i>
                  See Live Action
                </a>
                {!localStorage.getItem("currentUser") && (
                  <Link to="/login" className="btn-hero-outline">
                    Get Started Free
                  </Link>
                )}
              </div>
            </div>
            <div className="hero-stats-panel">
              <div className="stat-card">
                <div className="stat-icon red">🔥</div>
                <div className="stat-info">
                  <h3>{liveMatches.length}</h3>
                  <p>Live Now</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">📅</div>
                <div className="stat-info">
                  <h3>{approvedEvents.length}</h3>
                  <p>Active Events</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">👥</div>
                <div className="stat-info">
                  <h3>{matches.length}</h3>
                  <p>Total Matches</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live/Recent Matches Section (ID for Header) */}
        {displayMatches.length > 0 && (
          <section id="live" className="section-live">
            <div className="container">
              <div className="section-heading">
                <h2>
                  {liveMatches.length > 0 && (
                    <span className="live-pulse"></span>
                  )}
                  {liveMatches.length > 0 ? "Live Matches" : "Recent Matches"}
                </h2>
                {/* --- UPDATED LINK 1 --- */}
                <Link to="/all-matches#live" className="view-all-link">
                  View All <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
              <div className="live-matches-grid">
                {displayMatches.map((match) => (
                  <div
                    key={match._id}
                    className="live-match-card"
                    onClick={() => handleMatchClick(match)}
                  >
                    {match.status === "InProgress" && (
                      <div className="live-badge">
                        <span className="pulse-dot"></span>
                        LIVE
                      </div>
                    )}
                    {match.status === "Completed" && (
                      <div
                        className="live-badge"
                        style={{ background: "#10b981" }}
                      >
                        <i className="fas fa-check"></i>
                        COMPLETED
                      </div>
                    )}
                    <div className="match-teams">
                      <div className="team">
                        <h4>{match.teamA?.teamName || "Team A"}</h4>
                        <p className="team-score">
                          {match.status === "Completed"
                            ? match.scoreA || "0"
                            : "0"}
                          /
                          {match.status === "Completed"
                            ? match.wicketsA || "0"
                            : "0"}
                        </p>
                      </div>
                      <div className="vs">VS</div>
                      <div className="team">
                        <h4>{match.teamB?.teamName || "Team B"}</h4>
                        <p className="team-score">
                          {match.status === "Completed"
                            ? match.scoreB || "0"
                            : "0"}
                          /
                          {match.status === "Completed"
                            ? match.wicketsB || "0"
                            : "0"}
                        </p>
                      </div>
                    </div>
                    <div className="match-info">
                      <span>
                        <i className="fas fa-map-marker-alt"></i>
                        {match.venue || "Stadium"}
                      </span>
                      <span className="watch-now">
                        {match.status === "InProgress"
                          ? "Watch Now"
                          : "View Details"}{" "}
                        <i className="fas fa-play-circle"></i>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Events & Matches Combined (ID for Header) */}
        <section id="events" className="section-combined">
          <div className="container">
            <div className="two-column-layout">
              {/* Upcoming Events */}
              <div className="column">
                <div className="section-heading">
                  <h2>🎪 Upcoming Events</h2>
                  <button
                    onClick={handleViewAllEvents}
                    className="view-all-link"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    View All <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
                {approvedEvents.length === 0 ? (
                  <div className="empty-placeholder">
                    <i className="fas fa-calendar-times"></i>
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  <div className="events-list">
                    {approvedEvents.slice(0, 4).map((event) => (
                      <div
                        key={event._id}
                        className="event-item"
                        onClick={() => handleViewDetails(event)}
                      >
                        <div className="event-image">
                          <img
                            src={event.image || "/default-event.jpg"}
                            alt={event.name}
                          />
                        </div>
                        <div className="event-details">
                          <h4>{event.name}</h4>
                          <p className="event-meta">
                            <i className="far fa-calendar"></i>
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                          <p className="event-meta">
                            <i className="fas fa-map-marker-alt"></i>
                            {event.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleViewAllEvents}
                  className="btn-action-secondary"
                  style={{ width: "100%" }}
                >
                  <i className="fas fa-calendar-alt"></i>
                  View All Events
                </button>
              </div>

              {/* Upcoming Matches */}
              <div className="column">
                <div className="section-heading">
                  <h2>⚡ Upcoming Matches</h2>
                  {/* --- UPDATED LINK 2 --- */}
                  <Link to="/all-matches#upcoming" className="view-all-link">
                    View All <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
                {upcomingMatches.length === 0 ? (
                  <div className="empty-placeholder">
                    <i className="fas fa-trophy"></i>
                    <p>No upcoming matches</p>
                  </div>
                ) : (
                  <div className="matches-list">
                    {upcomingMatches.map((match) => (
                      <div
                        key={match._id}
                        className="match-item"
                        onClick={() => handleMatchClick(match)}
                      >
                        <div className="match-time">
                          <span className="time">{getTimeAgo(match.date)}</span>
                        </div>
                        <div className="match-matchup">
                          <span className="team-name">
                            {match.teamA?.teamName || "TBA"}
                          </span>
                          <span className="vs-small">vs</span>
                          <span className="team-name">
                            {match.teamB?.teamName || "TBA"}
                          </span>
                        </div>
                        <div className="match-venue">
                          <i className="fas fa-map-marker-alt"></i>
                          {match.venue || "TBA"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* --- UPDATED LINK 3 --- */}
                <Link to="/all-matches#upcoming" className="btn-action-secondary">
                  <i className="fas fa-trophy"></i>
                  View All Matches
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard Section (ID for Header) */}
        <section id="leaderboards" className="section-leaderboard">
          <div className="container">
            <div className="section-heading centered">
              <h2>🏅 Current Standings</h2>
              <p>Top performing teams this season</p>
            </div>

            {/* Event Selector */}
            {allEventsForLeaderboard.length > 0 && (
              <div className="leaderboard-event-selector">
                <label htmlFor="leaderboardEventSelect">Select Event:</label>
                <select
                  id="leaderboardEventSelect"
                  onChange={(e) => handleLeaderboardEventChange(e.target.value)}
                  value={selectedLeaderboardEvent?._id || ""}
                >
                  {allEventsForLeaderboard.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loadingLeaderboard ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading standings...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="empty-placeholder">
                <i className="fas fa-medal"></i>
                <p>
                  {selectedLeaderboardEvent
                    ? `No standings available for ${selectedLeaderboardEvent.name}`
                    : "No standings available yet"}
                </p>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#9ca3af",
                    marginTop: "0.5rem",
                  }}
                >
                  Standings will appear after matches are completed
                </p>
              </div>
            ) : (
              <>
                {selectedLeaderboardEvent && (
                  <h3
                    style={{
                      textAlign: "center",
                      color: "white",
                      marginBottom: "1.5rem",
                      fontSize: "1.25rem",
                      fontWeight: "600",
                    }}
                  >
                    {selectedLeaderboardEvent.name}
                  </h3>
                )}
                <div className="leaderboard-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Team</th>
                        <th>Played</th>
                        <th>Won</th>
                        <th>Lost</th>
                        <th>NRR</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, index) => (
                        <tr
                          key={entry.team?._id || index}
                          className={index < 3 ? "top-three" : ""}
                        >
                          <td>
                            <span className={`rank-badge rank-${index + 1}`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="team-cell">
                            <strong>{entry.team?.teamName || "Unknown"}</strong>
                          </td>
                          <td>{entry.matchesPlayed}</td>
                          <td className="win-cell">{entry.wins}</td>
                          <td className="loss-cell">{entry.losses}</td>
                          <td
                            className={
                              entry.nrr >= 0 ? "positive-nrr" : "negative-nrr"
                            }
                          >
                            {entry.nrr > 0 ? "+" : ""}
                            {entry.nrr.toFixed(3)}
                          </td>
                          <td className="points-cell">
                            <strong>{entry.points}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <div className="section-actions">
              <Link to="/points-table" className="btn-action-secondary">
                View Full Leaderboard
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Results (ID for Header "News") */}
        {recentMatches.length > 0 && (
          <section id="news" className="section-results">
            <div className="container">
              <div className="section-heading">
                <h2>📊 Recent Results (News)</h2>
                {/* --- UPDATED LINK 4 --- */}
                <Link to="/all-matches#completed" className="view-all-link">
                  View All <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
              <div className="results-grid">
                {recentMatches.map((match) => (
                  <div
                    key={match._id}
                    className="result-card"
                    onClick={() => handleMatchClick(match)}
                  >
                    <div className="result-header">
                      <span className="result-badge">Completed</span>
                      <span className="result-time">
                        {getTimeAgo(match.date)}
                      </span>
                    </div>
                    <div className="result-teams">
                      <div
                        className={`result-team ${
                          match.winner?._id === match.teamA?._id ? "winner" : ""
                        }`}
                      >
                        <h4>{match.teamA?.teamName || "Team A"}</h4>
                        {match.winner?._id === match.teamA?._id && (
                          <span className="winner-icon">🏆</span>
                        )}
                      </div>
                      <div
                        className={`result-team ${
                          match.winner?._id === match.teamB?._id ? "winner" : ""
                        }`}
                      >
                        <h4>{match.teamB?.teamName || "Team B"}</h4>
                        {match.winner?._id === match.teamB?._id && (
                          <span className="winner-icon">🏆</span>
                        )}
                      </div>
                    </div>
                    <div className="result-footer">
                      <span>{match.venue || "Stadium"}</span>
                      <span className="view-details-link">
                        View Details <i className="fas fa-chevron-right"></i>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="section-actions">
                {/* --- UPDATED LINK 5 --- */}
                <Link to="/all-matches#completed" className="btn-action-secondary">
                  View All Results
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Sports Categories */}
        <section className="section-sports">
          <div className="container">
            <div className="section-heading centered">
              <h2>🏆 Explore Sports</h2>
              <p>Find your game and join the competition</p>
            </div>
            <div className="sports-carousel">
              {[
                { name: "Cricket", icon: "⚾", color: "#10b981" },
                { name: "Football", icon: "⚽", color: "#3b82f6" },
                { name: "Basketball", icon: "🏀", color: "#f59e0b" },
                { name: "E-Sports", icon: "🎮", color: "#8b5cf6" },
                { name: "Tennis", icon: "🎾", color: "#06b6d4" },
                { name: "Badminton", icon: "🏸", color: "#84cc16" },
                { name: "Volleyball", icon: "🏐", color: "#ec4899" },
                { name: "Swimming", icon: "🏊", color: "#0ea5e9" },
              ].map((sport) => (
                <div key={sport.name} className="sport-card">
                  <div
                    className="sport-icon-circle"
                    style={{
                      backgroundColor: `${sport.color}15`,
                      color: sport.color,
                    }}
                  >
                    <span className="sport-emoji">{sport.icon}</span>
                  </div>
                  <h4>{sport.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-cta">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Make Your Mark?</h2>
              <p>
                Join thousands of athletes competing, winning, and making
                memories. Your championship journey starts here.
              </p>
              {!localStorage.getItem("currentUser") && (
                <Link to="/login" className="btn-cta-large">
                  Create Free Account
                  <i className="fas fa-arrow-right"></i>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HomePage;