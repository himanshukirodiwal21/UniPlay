import React, { useEffect, useState, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../assets/HomePage.css"; // Reusing the homepage styles

// --- 1. Define initial items to show ---
const INITIAL_GRID_SHOW = 6;
const INITIAL_LIST_SHOW = 5;

const AllMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // --- 2. Add state for visible items per section ---
  const [visibleLive, setVisibleLive] = useState(INITIAL_GRID_SHOW);
  const [visibleUpcoming, setVisibleUpcoming] = useState(INITIAL_LIST_SHOW);
  const [visibleCompleted, setVisibleCompleted] = useState(INITIAL_GRID_SHOW);

  const navigate = useNavigate();
  const location = useLocation(); // To read the URL hash (#live, #upcoming)

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1); // remove #
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location, loadingMatches]);

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

  const liveMatches = useMemo(
    () => matches.filter((m) => m.status === "InProgress"),
    [matches]
  );

  const upcomingMatches = useMemo(
    () => matches.filter((m) => m.status === "Scheduled"),
    [matches]
  );

  const completedMatches = useMemo(
    () => matches.filter((m) => m.status === "Completed"),
    [matches]
  );

  const handleMatchClick = (match) => {
    if (match.status === "InProgress") {
      navigate(`/live-match/${match._id}`);
    } else if (match.status === "Completed") {
      navigate(`/match-result/${match._id}`);
    } else {
      navigate(`/match/${match._id}`);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <>
      <Header />
      <main className="modern-main">
        <div className="container all-matches-page">
          <div className="all-matches-header">
            <h1>All Matches</h1>
            <p>Browse all live, upcoming, and completed matches.</p>
          </div>

          {/* --- Loading State --- */}
          {loadingMatches && (
            <div className="loading-spinner" style={{ minHeight: "50vh" }}>
              <div className="spinner"></div>
              <p>Loading all matches...</p>
            </div>
          )}

          {/* --- Content Sections (post-loading) --- */}
          {!loadingMatches && (
            <>
              {/* --- 1. Live Matches Section --- */}
              <section id="live" className="section-live all-matches-section">
                <div className="section-heading">
                  <h2>
                    <span className="live-pulse"></span>
                    Live Matches
                  </h2>
                </div>
                {liveMatches.length === 0 ? (
                  <div className="empty-placeholder compact">
                    <p>No matches are currently live.</p>
                  </div>
                ) : (
                  <>
                    <div className="live-matches-grid">
                      {/* --- 3. Use .slice() to show only visible matches --- */}
                      {liveMatches.slice(0, visibleLive).map((match) => (
                        <div
                          key={match._id}
                          className="live-match-card"
                          onClick={() => handleMatchClick(match)}
                        >
                          <div className="live-badge">
                            <span className="pulse-dot"></span>LIVE
                          </div>
                          <div className="match-teams">
                            <div className="team">
                              <h4>{match.teamA?.teamName || "Team A"}</h4>
                            </div>
                            <div className="vs">VS</div>
                            <div className="team">
                              <h4>{match.teamB?.teamName || "Team B"}</h4>
                            </div>
                          </div>
                          <div className="match-info">
                            <span>
                              <i className="fas fa-map-marker-alt"></i>
                              {match.venue || "Stadium"}
                            </span>
                            <span className="watch-now">
                              Watch Now <i className="fas fa-play-circle"></i>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* --- 4. Add "View More" / "Show Less" buttons --- */}
                    <div className="section-actions">
                      {visibleLive < liveMatches.length && (
                        <button
                          onClick={() => setVisibleLive(liveMatches.length)}
                          className="btn-action-secondary"
                        >
                          View More Live Matches
                        </button>
                      )}
                      {visibleLive > INITIAL_GRID_SHOW && (
                        <button
                          onClick={() => setVisibleLive(INITIAL_GRID_SHOW)}
                          className="btn-action-secondary"
                        >
                          Show Less
                        </button>
                      )}
                    </div>
                  </>
                )}
              </section>

              {/* --- 2. Upcoming Matches Section --- */}
              <section
                id="upcoming"
                className="section-upcoming-full all-matches-section"
              >
                <div className="section-heading">
                  <h2>⚡ Upcoming Matches</h2>
                </div>
                {upcomingMatches.length === 0 ? (
                  <div className="empty-placeholder compact">
                    <p>No upcoming matches scheduled.</p>
                  </div>
                ) : (
                  <>
                    <div className="matches-list-full">
                      {/* --- 3. Use .slice() to show only visible matches --- */}
                      {upcomingMatches
                        .slice(0, visibleUpcoming)
                        .map((match) => (
                          <div
                            key={match._id}
                            className="match-item"
                            onClick={() => handleMatchClick(match)}
                          >
                            <div className="match-time">
                              <span className="time">
                                {getTimeAgo(match.date)}
                              </span>
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

                    {/* --- 4. Add "View More" / "Show Less" buttons --- */}
                    <div className="section-actions">
                      {visibleUpcoming < upcomingMatches.length && (
                        <button
                          onClick={() =>
                            setVisibleUpcoming(upcomingMatches.length)
                          }
                          className="btn-action-secondary"
                        >
                          View More Upcoming Matches
                        </button>
                      )}
                      {visibleUpcoming > INITIAL_LIST_SHOW && (
                        <button
                          onClick={() =>
                            setVisibleUpcoming(INITIAL_LIST_SHOW)
                          }
                          className="btn-action-secondary"
                        >
                          Show Less
                        </button>
                      )}
                    </div>
                  </>
                )}
              </section>

              {/* --- 3. Completed Matches Section --- */}
              <section
                id="completed"
                className="section-results all-matches-section"
              >
                <div className="section-heading">
                  <h2>📊 Completed Results</h2>
                </div>
                {completedMatches.length === 0 ? (
                  <div className="empty-placeholder compact">
                    <p>No matches have been completed yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="results-grid">
                      {/* --- 3. Use .slice() to show only visible matches --- */}
                      {completedMatches
                        .slice(0, visibleCompleted)
                        .map((match) => (
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
                                  match.winner?._id === match.teamA?._id
                                    ? "winner"
                                    : ""
                                }`}
                              >
                                <h4>{match.teamA?.teamName || "Team A"}</h4>
                                {match.winner?._id === match.teamA?._id && (
                                  <span className="winner-icon">🏆</span>
                                )}
                              </div>
                              <div
                                className={`result-team ${
                                  match.winner?._id === match.teamB?._id
                                    ? "winner"
                                    : ""
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
                                View Details{" "}
                                <i className="fas fa-chevron-right"></i>
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* --- 4. Add "View More" / "Show Less" buttons --- */}
                    <div className="section-actions">
                      {visibleCompleted < completedMatches.length && (
                        <button
                          onClick={() =>
                            setVisibleCompleted(completedMatches.length)
                          }
                          className="btn-action-secondary"
                        >
                          View More Results
                        </button>
                      )}
                      {visibleCompleted > INITIAL_GRID_SHOW && (
                        <button
                          onClick={() =>
                            setVisibleCompleted(INITIAL_GRID_SHOW)
                          }
                          className="btn-action-secondary"
                        >
                          Show Less
                        </button>
                      )}
                    </div>
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AllMatches;