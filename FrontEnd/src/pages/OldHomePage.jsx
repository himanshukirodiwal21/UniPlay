import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate, Link } from "react-router-dom";

const OldHomePage = () => {
  const [events, setEvents] = useState([]);
  const [recentNews, setRecentNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true); // ADD THIS LINE
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchEvents();
    fetchRecentNews();
    fetchLeaderboard();
  }, []);

  const fetchRecentNews = async () => {
    try {
      setLoadingNews(true);
      const BACKEND_URL = "http://localhost:8000";

      const [eventsRes, matchesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/v1/events`),
        fetch(`${BACKEND_URL}/api/v1/matches`),
      ]);

      const eventsData = await eventsRes.json();
      const matchesData = await matchesRes.json();

      const events = eventsData.data || [];
      const matches = matchesData.data || [];

      const generatedNews = [];

      // Live Matches - Highest priority
      const liveMatches = matches.filter((m) => m.status === "InProgress");
      for (const match of liveMatches) {
        generatedNews.push({
          id: `live-${match._id}`,
          type: "match",
          category: "Live Match",
          title: `🔴 LIVE: ${match.teamA?.teamName} vs ${match.teamB?.teamName}`,
          description: `Catch the action live as ${
            match.teamA?.teamName
          } takes on ${match.teamB?.teamName}${
            match.venue ? ` at ${match.venue}` : ""
          }`,
          timestamp: new Date(match.date || match.createdAt),
          color: "#ef4444",
          priority: 0,
          matchId: match._id,
        });
      }

      // Recent Match Results
      const completedMatches = matches
        .filter((m) => m.status === "Completed")
        .slice(0, 3);
      completedMatches.forEach((match) => {
        const winnerName = match.winner?.teamName || "TBD";
        const loserName =
          match.winner?._id === match.teamA?._id
            ? match.teamB?.teamName
            : match.teamA?.teamName;

        generatedNews.push({
          id: `match-${match._id}`,
          type: "match",
          category: "Match Result",
          title: `🏆 ${winnerName} Defeats ${loserName}`,
          description: `${winnerName} emerged victorious in ${
            match.stage || "a thrilling"
          } encounter${match.venue ? ` at ${match.venue}` : ""}`,
          timestamp: new Date(match.date || match.createdAt),
          color: "#10b981",
          priority: 2,
          matchId: match._id,
        });
      });

      // Upcoming Events
      events.slice(0, 2).forEach((event) => {
        const eventDate = new Date(event.date || event.createdAt);
        generatedNews.push({
          id: `event-${event._id}`,
          type: "event",
          category: "Upcoming Event",
          title: `📅 ${event.name} Starting Soon!`,
          description: `Get ready for ${event.name} tournament${
            event.location ? ` at ${event.location}` : ""
          }`,
          timestamp: eventDate,
          color: "#3b82f6",
          priority: 4,
          eventId: event._id,
        });
      });

      // Sort by priority and timestamp
      generatedNews.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.timestamp - a.timestamp;
      });

      setRecentNews(generatedNews.slice(0, 5));
    } catch (err) {
      console.error("Error fetching news:", err);
      setRecentNews([]);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleViewDetails = (event) => {
    navigate(`/event/${event._id}`, { state: { event } });
  };

  const handleNewsClick = (item) => {
    if (item.type === "match" && item.matchId) {
      if (item.category === "Live Match") {
        navigate(`/live-match/${item.matchId}`);
      } else {
        navigate(`/match-result/${item.matchId}`);
      }
    } else if (item.type === "event" && item.eventId) {
      navigate(`/event/${item.eventId}`);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);

      // Fetch all events
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

      // Sort events by date (newest first)
      const sortedEvents = [...allEvents].sort(
        (a, b) =>
          new Date(b.createdAt || b.date || 0) -
          new Date(a.createdAt || a.date || 0)
      );

      // Try to find an event with completed matches
      let selectedEvent = null;
      let completedMatches = [];

      for (const event of sortedEvents) {
        // Fetch completed matches for this event
        const matchesRes = await fetch(
          `http://localhost:8000/api/v1/matches?status=Completed&event=${event._id}`
        );

        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          const matches = matchesData.data || [];

          if (matches.length > 0) {
            selectedEvent = event;
            completedMatches = matches;
            console.log(
              `✅ Found ${matches.length} completed matches for event: ${event.name}`
            );
            break; // Stop at the first event with completed matches
          }
        }
      }

      // If no event has completed matches, check for in-progress matches
      if (completedMatches.length === 0) {
        for (const event of sortedEvents) {
          const matchesRes = await fetch(
            `http://localhost:8000/api/v1/matches?status=InProgress&event=${event._id}`
          );

          if (matchesRes.ok) {
            const matchesData = await matchesRes.json();
            const matches = matchesData.data || [];

            if (matches.length > 0) {
              selectedEvent = event;
              console.log(
                `⏳ Event "${event.name}" has in-progress matches, showing placeholder`
              );
              setLeaderboard([]);
              setLoadingLeaderboard(false);
              return;
            }
          }
        }
      }

      if (completedMatches.length === 0) {
        console.log("❌ No completed matches found in any event");
        setLeaderboard([]);
        setLoadingLeaderboard(false);
        return;
      }

      console.log(
        `📊 Calculating leaderboard for event: ${selectedEvent.name}`
      );

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

      // Calculate points for each team
      const teamStats = {};

      matchesWithScores.forEach((match) => {
        const teamA = match.teamA;
        const teamB = match.teamB;
        const winner = match.winner;

        if (!teamA || !teamB) return;

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

        teamStats[teamA._id].matchesPlayed++;
        teamStats[teamB._id].matchesPlayed++;

        const scoreA = match.teamAScore || 0;
        const scoreB = match.teamBScore || 0;
        const oversA = match.teamAOvers || 0;
        const oversB = match.teamBOvers || 0;

        teamStats[teamA._id].totalRunsScored += scoreA;
        teamStats[teamA._id].totalOversPlayed += oversA;
        teamStats[teamA._id].totalRunsConceded += scoreB;
        teamStats[teamA._id].totalOversBowled += oversB;

        teamStats[teamB._id].totalRunsScored += scoreB;
        teamStats[teamB._id].totalOversPlayed += oversB;
        teamStats[teamB._id].totalRunsConceded += scoreA;
        teamStats[teamB._id].totalOversBowled += oversA;

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
      });

      // Sort and take top 3 for homepage
      const leaderboardData = Object.values(teamStats)
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (Math.abs(b.nrr - a.nrr) > 0.001) return b.nrr - a.nrr;
          if (b.wins !== a.wins) return b.wins - a.wins;
          return a.matchesPlayed - b.matchesPlayed;
        })
        .slice(0, 3);

      console.log(
        `✅ Leaderboard calculated with ${leaderboardData.length} teams`
      );
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setLeaderboard([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  return (
    <>
      <Header />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content container">
            <h1>Ignite the Rivalry. Unite the Campus.</h1>
            <p>
              Welcome to UniPlay, the heart of every game, match, and tournament
              at our university. Your central hub to compete, connect, and
              conquer.
            </p>
            <div className="hero-buttons">
              <a href="#events" className="btn btn-primary">
                → Explore Events
              </a>
              {!localStorage.getItem("currentUser") && (
                <a href="/login" className="btn btn-secondary">
                  Create Your Account
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section id="events" className="container section">
          <h2 className="section-title">🔥 Upcoming Events</h2>
          <div className="card-grid">
            {events.length === 0 ? (
              <p
                style={{
                  fontSize: "1.2rem",
                  color: "#555",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                No upcoming events approved by admin yet. Check back later!
              </p>
            ) : (
              events
                .filter((event) => event.status === "approved")
                .map((event) => (
                  <div key={event._id} className="card">
                    <img
                      src={event.image || "/default-event.jpg"}
                      alt={event.name}
                    />
                    <div className="card-content">
                      <h3>{event.name}</h3>
                      <p>
                        <i className="fa-regular fa-calendar-alt"></i> Starts:{" "}
                        {event.date}
                      </p>
                      <p>
                        <i className="fa-solid fa-location-dot"></i>{" "}
                        {event.location}
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleViewDetails(event)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
          <br />
          <a href="/request-event" className="btn btn-primary">
            Request Event
          </a>
        </section>

        {/* Sports Section */}
        <section id="sports" className="container section">
          <h2 className="section-title">🏆 Choose Your Game</h2>
          <div className="sports-grid">
            {[
              { name: "Cricket", icon: "fa-baseball-bat-ball" },
              { name: "Football", icon: "fa-futbol" },
              { name: "Basketball", icon: "fa-basketball" },
              { name: "E-Sports", icon: "fa-gamepad" },
              { name: "Chess", icon: "fa-chess-knight", style: "fa-regular" },
              { name: "Volleyball", icon: "fa-volleyball-ball" },
              { name: "Tennis", icon: "fa-table-tennis-paddle-ball" },
              { name: "Badminton", icon: "fa-shuttlecock" },
              { name: "Hockey", icon: "fa-hockey-puck" },
              { name: "Golf", icon: "fa-golf-ball-tee" },
              { name: "Swimming", icon: "fa-person-swimming" },
              { name: "Running", icon: "fa-person-running" },
              { name: "Boxing", icon: "fa-hand-fist" },
              { name: "Cycling", icon: "fa-person-biking" },
              { name: "Skating", icon: "fa-person-skating" },
              { name: "Snowboarding", icon: "fa-person-snowboarding" },
              { name: "Surfing", icon: "fa-person-surfing" },
              { name: "Gymnastics", icon: "fa-person-digging" },
              { name: "Table Tennis", icon: "fa-table-tennis-paddle-ball" },
              { name: "Martial Arts", icon: "fa-hand-sparkles" },
              { name: "Archery", icon: "fa-bow-arrow" },
              { name: "Skateboarding", icon: "fa-person-skating" },
            ].map((sport) => (
              <div key={sport.name} className="sport-item">
                <i className={`${sport.style || "fa-solid"} ${sport.icon}`}></i>
                {sport.name}
              </div>
            ))}
          </div>
        </section>

        {/* News Section */}
        <section id="news" className="container section">
          <h2 className="section-title">📢 Latest News & Updates</h2>

          {loadingNews ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}
            >
              <p>Loading latest news...</p>
            </div>
          ) : recentNews.length === 0 ? (
            <div className="card-grid">
              <div className="card">
                <img
                  src="https://images.unsplash.com/photo-1627843518544-64cb2a98f1a4?q=80&w=2070&auto=format&fit=crop"
                  alt="Winning Team"
                />
                <div className="card-content">
                  <h3>Mechanical Mavericks Clinch the Football Trophy!</h3>
                  <p>
                    In a nail-biting final, the Department of Mechanical
                    Engineering secured a last-minute goal to win the
                    championship.
                  </p>
                  <a href="#" className="read-more">
                    Read Full Story →
                  </a>
                </div>
              </div>
              <div className="card">
                <img
                  src="https://images.unsplash.com/photo-1616594418293-849a6067743b?q=80&w=2070&auto=format&fit=crop"
                  alt="E-sports league"
                />
                <div className="card-content">
                  <h3>Registration Opens for E-Sports League: S3</h3>
                  <p>
                    Get your squads ready! Registrations are now live for the
                    biggest gaming event on campus this semester.
                  </p>
                  <a href="#" className="read-more">
                    Find Out More →
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="card-grid">
                {recentNews.map((item) => (
                  <div
                    key={item.id}
                    className="card news-card"
                    onClick={() => handleNewsClick(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="news-badge"
                      style={{
                        backgroundColor: item.color,
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        display: "inline-block",
                        marginBottom: "12px",
                      }}
                    >
                      {item.category}
                    </div>
                    <div className="card-content">
                      <h3 style={{ marginBottom: "8px" }}>{item.title}</h3>
                      <p style={{ color: "#666", marginBottom: "12px" }}>
                        {item.description}
                      </p>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#999",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>{getTimeAgo(item.timestamp)}</span>
                        <span className="read-more">Read More →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <Link to="/news" className="btn btn-secondary">
                  View All News
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Leaderboards Section */}
        <section id="leaderboards" className="container section">
          <h2 className="section-title">🥇 University Leaderboards</h2>
          <div className="table-container">
            {loadingLeaderboard ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <p>Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <p>
                  No completed matches yet. Check back after matches are
                  finished!
                </p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>Matches</th>
                    <th>W / L / D</th>
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
                        <strong>
                          {entry.team?.teamName || "Unknown Team"}
                        </strong>
                      </td>
                      <td>{entry.matchesPlayed}</td>
                      <td>
                        <span style={{ color: "#16a34a", fontWeight: "600" }}>
                          {entry.wins}
                        </span>
                        {" / "}
                        <span style={{ color: "#dc2626", fontWeight: "600" }}>
                          {entry.losses}
                        </span>
                        {" / "}
                        <span style={{ color: "#2563eb", fontWeight: "600" }}>
                          {entry.draws}
                        </span>
                      </td>
                      <td
                        style={{
                          color:
                            entry.nrr > 0
                              ? "#16a34a"
                              : entry.nrr < 0
                              ? "#dc2626"
                              : "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        {entry.nrr > 0 ? "+" : ""}
                        {entry.nrr.toFixed(3)}
                      </td>
                      <td>
                        <strong
                          style={{
                            color: "#16a34a",
                            fontSize: "1.1rem",
                          }}
                        >
                          {entry.points}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link to="/points-table" className="btn btn-secondary">
              View Full Leaderboards
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2>Ready to Join the Action?</h2>
            <p>
              Whether you want to lead your team to victory, organize the next
              big tournament, or cheer from the sidelines, your journey starts
              here.
            </p>
            {!localStorage.getItem("currentUser") && (
              <a href="/login" className="btn btn-primary">
                Create Your Account
              </a>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default OldHomePage;
