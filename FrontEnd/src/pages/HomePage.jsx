import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HomePage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/events");
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data);
        // localStorage.setItem("uniplay_events", JSON.stringify(data)); // REMOVED
      } catch (err) {
        console.error("Error fetching events:", err);
        // fallback - show empty array
        setEvents([]);
      }
    };

    fetchEvents();
  }, []);

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
              <a href="register_your_team.html" className="btn btn-secondary">
                Register Your Team
              </a>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section id="events" className="container section">
          <h2 className="section-title">🔥 Upcoming Events</h2>
          <div className="card-grid">
            {events.length === 0 ? (
              <p style={{ fontSize: "1.2rem", color: "#555", textAlign: "center", width: "100%" }}>
                No upcoming events approved by admin yet. Check back later!
              </p>
            ) : (
              events
                .filter((event) => event.status === "approved") // only show approved events
                .map((event) => (
                  <div key={event._id} className="card">
                    <img src={event.image || "/default-event.jpg"} alt={event.name} />
                    <div className="card-content">
                      <h3>{event.name}</h3>
                      <p>
                        <i className="fa-regular fa-calendar-alt"></i> Starts: {event.date}
                      </p>
                      <p>
                        <i className="fa-solid fa-location-dot"></i> {event.location}
                      </p>
                      <a href={`/event/${event._id}`} className="btn btn-secondary">
                        View Details
                      </a>
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
              "Cricket",
              "Football",
              "Basketball",
              "E-Sports",
              "Chess",
              "Volleyball",
            ].map((sport) => (
              <div key={sport} className="sport-item">
                <i
                  className={`fa-solid ${sport === "Cricket"
                      ? "fa-baseball-bat-ball"
                      : sport === "Football"
                        ? "fa-futbol"
                        : sport === "Basketball"
                          ? "fa-basketball"
                          : sport === "E-Sports"
                            ? "fa-gamepad"
                            : sport === "Volleyball"
                              ? "fa-volleyball"
                              : ""
                    }`}
                ></i>{" "}
                {sport}
              </div>
            ))}
            <div className="sport-item">
              <i className="fa-regular fa-chess-knight"></i> Chess
            </div>
          </div>
        </section>

        {/* News Section */}
        <section id="news" className="container section">
          <h2 className="section-title">📢 News & Highlights</h2>
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
        </section>

        {/* Leaderboards Section */}
        <section id="leaderboards" className="container section">
          <h2 className="section-title">🥇 University Leaderboards</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team / Player</th>
                  <th>Sport</th>
                  <th>Points / Wins</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>CSE Titans</td>
                  <td>Cricket</td>
                  <td>1200</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>'Alpha' Singh</td>
                  <td>Chess</td>
                  <td>18 W</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Team Invictus</td>
                  <td>Valorant</td>
                  <td>1150</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <a href="#" className="btn btn-secondary">
              View Full Leaderboards
            </a>
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
            <a href="#" className="btn btn-primary">
              Create Your Account
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HomePage;
