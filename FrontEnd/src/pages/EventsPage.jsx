import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/EventsPage.css";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, past
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: "instant" });
    
    fetchEvents();

    // Save scroll position before unmounting
    return () => {
      sessionStorage.setItem("eventsPageScrollPosition", window.scrollY.toString());
    };
  }, []);

  useEffect(() => {
    // Restore scroll position if returning from another page
    const savedPosition = sessionStorage.getItem("eventsPageScrollPosition");
    if (savedPosition && location.state?.fromEventDetails) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedPosition), behavior: "instant" });
      }, 100);
    }
  }, [location.state]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/v1/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      const eventsArray = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      setEvents(eventsArray);
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (event) => {
    // Save current scroll position
    sessionStorage.setItem("eventsPageScrollPosition", window.scrollY.toString());
    navigate(`/event/${event._id}`, { state: { event, fromEventsPage: true } });
  };

  const getTimeRemaining = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diff = eventDate - now;

    if (diff < 0) return "Past Event";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const isEventPast = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const filteredEvents = events
    .filter((event) => {
      // Status filter
      if (filter === "upcoming" && isEventPast(event.date)) return false;
      if (filter === "past" && !isEventPast(event.date)) return false;
      if (event.status !== "approved") return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.name?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcomingCount = events.filter((e) => !isEventPast(e.date) && e.status === "approved").length;
  const pastCount = events.filter((e) => isEventPast(e.date) && e.status === "approved").length;

  return (
    <>
      <Header />

      <main className="events-page">
        {/* Hero Section */}
        <section className="events-hero">
          <div className="container">
            <div className="events-hero-content">
              <h1 className="events-hero-title">
                <span className="gradient-text">All Events</span>
              </h1>
              <p className="events-hero-subtitle">
                Discover and participate in exciting tournaments and competitions
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="events-filters-section">
          <div className="container">
            <div className="events-filters-wrapper">
              <div className="events-search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search events by name, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="events-search-input"
                />
              </div>

              <div className="events-filter-tabs">
                <button
                  className={`filter-tab ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  All Events
                  <span className="filter-count">{events.filter(e => e.status === "approved").length}</span>
                </button>
                <button
                  className={`filter-tab ${filter === "upcoming" ? "active" : ""}`}
                  onClick={() => setFilter("upcoming")}
                >
                  Upcoming
                  <span className="filter-count">{upcomingCount}</span>
                </button>
                <button
                  className={`filter-tab ${filter === "past" ? "active" : ""}`}
                  onClick={() => setFilter("past")}
                >
                  Past
                  <span className="filter-count">{pastCount}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="events-grid-section">
          <div className="container">
            {loading ? (
              <div className="events-loading">
                <div className="spinner-large"></div>
                <p>Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="events-empty">
                <i className="fas fa-calendar-times"></i>
                <h3>No Events Found</h3>
                <p>
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "No events available at the moment"}
                </p>
              </div>
            ) : (
              <div className="events-grid">
                {filteredEvents.map((event) => {
                  const isPast = isEventPast(event.date);
                  return (
                    <div
                      key={event._id}
                      className={`event-card-full ${isPast ? "past-event" : ""}`}
                      onClick={() => handleViewDetails(event)}
                    >
                      <div className="event-card-image">
                        <img
                          src={event.image || "/default-event.jpg"}
                          alt={event.name}
                          onError={(e) => {
                            e.target.src = "/default-event.jpg";
                          }}
                        />
                        <div className="event-card-overlay">
                          <span className="event-view-btn">
                            View Details <i className="fas fa-arrow-right"></i>
                          </span>
                        </div>
                        {!isPast && (
                          <div className="event-time-badge">
                            <i className="far fa-clock"></i>
                            {getTimeRemaining(event.date)}
                          </div>
                        )}
                        {isPast && (
                          <div className="event-past-badge">
                            <i className="fas fa-check-circle"></i>
                            Completed
                          </div>
                        )}
                      </div>

                      <div className="event-card-body">
                        <h3 className="event-card-title">{event.name}</h3>
                        
                        <div className="event-card-info">
                          <div className="event-info-item">
                            <i className="far fa-calendar"></i>
                            <span>{new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
                          </div>
                          <div className="event-info-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{event.location || "TBA"}</span>
                          </div>
                        </div>

                        {event.description && (
                          <p className="event-card-description">
                            {event.description.length > 120
                              ? `${event.description.substring(0, 120)}...`
                              : event.description}
                          </p>
                        )}

                        <div className="event-card-footer">
                          <div className="event-sports-tag">
                            <i className="fas fa-trophy"></i>
                            {event.sport || "Multi-Sport"}
                          </div>
                          <button className="event-details-btn">
                            Learn More <i className="fas fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default EventsPage;