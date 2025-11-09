import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Eye, Calendar, Loader2 } from 'lucide-react'; // Added Loader2 for loading state

// --- Helper Component for Admin Buttons ---
// Receives 'styles' prop to apply the *exact* original styles
const AdminActions = ({ event, loading, onGenerateSchedule, styles }) => {
  const navigate = useNavigate();
  return (
    <>
      {/* Generate Schedule Button - Admin Only */}
      {!event?.scheduleGenerated && (
        <button
          style={styles.scheduleButton} // Uses original style
          onClick={onGenerateSchedule}
          disabled={loading}
        >
          <Calendar size={20} />
          <span>{loading ? 'Generating...' : '⚡ Generate Match Schedule'}</span>
        </button>
      )}

      {event?.scheduleGenerated && (
        <div style={{
          ...styles.scheduleButton, // Uses original style
          cursor: 'default',
          backgroundColor: '#10b981'
        }}>
          <Calendar size={20} />
          <span>✅ Schedule Generated</span>
        </div>
      )}

      {/* Scorer Login */}
      <button 
        onClick={() => navigate('/ScorerDashboard', { state: { event } })}
        className="btn btn-primary" // Uses original class
      >
        Scorer Login
      </button>
    </>
  );
};

// --- Helper Component for Public Buttons ---
// Receives 'styles' prop to apply the *exact* original styles
const PublicActions = ({ event, styles }) => {
  const navigate = useNavigate();
  return (
    <>
      {/* View Live Matches */}
      <button 
        className="btn btn-secondary" // Uses original class
        onClick={() => navigate('/EventMatches', { state: { event } })}
        style={{ // Uses original inline style
          backgroundColor: '#b33b3bff',
          color: '#ffffffff',
          border: 'none',
        }}
      >
        View Live Matches
      </button>

      {/* points table */}
      <button 
        onClick={() => navigate('/points-table', { state: { event } })}
        className="btn btn-primary" // Uses original class
      >
        Points Table
      </button>

      {/* View Registered Teams */}
      <button
        onClick={() => navigate(`/registered-teams/${event?._id}`)}
        className="btn btn-secondary btn-view-teams" // Uses original class
      >
        <Eye size={20} />
        <span>View All Registered Teams</span>
      </button>
    </>
  );
};


// --- Main Component ---
export default function EventLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId } = useParams(); // <-- NEW: Get ID from URL

  // Event data can come from location state OR be fetched
  const [event, setEvent] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(false); // For schedule generation
  const [pageLoading, setPageLoading] = useState(!event); // <-- NEW: For initial page load
  const [message, setMessage] = useState('');

  // --- NEW: Robust Data Fetching ---
  // If event is not in location state (e.g., page refresh), fetch it.
  useEffect(() => {
    // Only fetch if we have no event AND we have an eventId from the URL
    if (!event && eventId) {
      const fetchEvent = async () => {
        setPageLoading(true);
        try {
          // --- THIS IS THE API CALL YOU MUST FIX ON YOUR BACKEND ---
          // It MUST .populate('requestedBy') to get admin data
          const res = await fetch(`http://localhost:8000/api/events/${eventId}`);
          if (!res.ok) throw new Error('Event not found');
          const data = await res.json();
          setEvent(data); // Set the event data from the API
        } catch (err)
 {
          console.error(err);
          setMessage(`❌ Error: ${err.message}`);
        } finally {
          setPageLoading(false);
        }
      };
      fetchEvent();
    }
  }, [event, eventId]); // Re-run if eventId changes

  // --- Cleaner Admin Check ---
  const currentUser = useMemo(() => {
    const userString = localStorage.getItem("currentUser");
    return userString ? JSON.parse(userString) : null;
  }, []);

  const isEventAdmin = useMemo(() => {
    // This check is now safer
    // It still relies on event.requestedBy being populated by your backend
    return currentUser?.id === event?.requestedBy?.id;
  }, [currentUser, event]);
  
  // --- DEBUGGING: Check your console for these values ---
  console.log("EventLanding - Current User:", currentUser ? JSON.stringify(currentUser, null, 2) : null);
  console.log("EventLanding - Event Object:", event ? JSON.stringify(event, null, 2) : null);
  console.log("EventLanding - Is Admin?", isEventAdmin);
  // --------------------------------------------------------

  // --- Original handleGenerateSchedule function (no changes) ---
  const handleGenerateSchedule = async () => {
    if (!event || !event._id) {
      alert('Event ID missing!');
      return;
    }
    // ... (rest of your function is unchanged) ...
    if (event.scheduleGenerated) {
      alert('Schedule already generated for this event!');
      return;
    }
    try {
      setLoading(true);
      setMessage('Generating schedule...');
      const response = await fetch(
        `http://localhost:8000/api/v1/matches/${event._id}/generateSchedule`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage(`✅ ${data.message}`);
        alert(`Schedule Generated!\n\n${data.summary.totalMatches} matches created:\n- Round Robin: ${data.summary.roundRobinMatches}\n- Knockout: ${data.summary.knockoutMatches}\n- Start Date: ${data.summary.startDate}`);
        setEvent(prev => ({ ...prev, scheduleGenerated: true })); // Update local state
      } else {
        setMessage(`❌ ${data.msg || data.message}`);
        alert(data.msg || data.message);
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage('❌ Failed to generate schedule');
      alert('Error: Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  // --- Original styles object (no changes) ---
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #9ca3af 100%)',
    },
    heroContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '80px 20px',
    },
    hero: {
      background: 'linear-gradient(135deg, #374151, #4b5563)',
      color: 'white',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      padding: '80px 40px',
      textAlign: 'center',
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '20px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    },
    subtitle: {
      fontSize: '1.2rem',
      opacity: 0.95,
    },
    buttonContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      justifyContent: 'center',
      marginTop: '40px',
      padding: '0 20px',
    },
    scheduleButton: { // This style is now passed to the helper component
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: event?.scheduleGenerated ? '#10b981' : '#f59e0b',
      color: '#ffffff',
      border: 'none',
      padding: '14px 28px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.6 : 1,
      transition: 'all 0.3s',
    },
    messageBox: {
      marginTop: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
      color: message.includes('✅') ? '#065f46' : '#991b1b',
      fontWeight: '500',
      textAlign: 'center',
    },
    // --- NEW: Style for loading state ---
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '10rem',
      color: 'white',
      gap: '1rem',
    },
    iconSpin: {
      animation: 'spin 1s linear infinite',
    }
  };

  // --- NEW: Loading State for Initial Fetch ---
  if (pageLoading) {
    return (
      <>
        {/* Add keyframes for iconSpin */}
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        <Header />
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <Loader2 size={40} style={styles.iconSpin} />
            <p>Loading Event...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // --- Main Render (Now cleaner) ---
  return (
    <>
      {/* Add keyframes for iconSpin */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <Header />
      <div style={styles.container}>
        <div style={styles.heroContainer}>
          <div style={styles.hero}>
            <h1 style={styles.title}>
              🏆 {event?.name || 'Event Landing Page'}
            </h1>
            <p style={styles.subtitle}>
              Live scoring • Real-time updates • Complete statistics
            </p>
          </div>

          {message && (
            <div style={styles.messageBox}>
              {message}
            </div>
          )}

          <div style={styles.buttonContainer}>
            
            {/* --- CLEANED UP: Logic is moved to components --- */}
            {isEventAdmin && (
              <AdminActions 
                event={event} 
                loading={loading}
                onGenerateSchedule={handleGenerateSchedule}
                styles={styles} // Pass styles object
              />
            )}
            
            <PublicActions event={event} styles={styles} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}