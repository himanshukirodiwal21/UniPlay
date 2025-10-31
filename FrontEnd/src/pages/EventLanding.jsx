import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Eye, Calendar } from 'lucide-react';

export default function EventLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Generate Schedule Function
  const handleGenerateSchedule = async () => {
    if (!event || !event._id) {
      alert('Event ID missing!');
      return;
    }

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
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`✅ ${data.message}`);
        alert(`Schedule Generated!\n\n${data.summary.totalMatches} matches created:\n- Round Robin: ${data.summary.roundRobinMatches}\n- Knockout: ${data.summary.knockoutMatches}\n- Start Date: ${data.summary.startDate}`);
        
        // Update event state to reflect schedule generated
        if (location.state?.event) {
          location.state.event.scheduleGenerated = true;
        }
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
    scheduleButton: {
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
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.heroContainer}>
          <div style={styles.hero}>
            <h1 style={styles.title}>
              🏆 {event?.name || 'College Cricket Tournament 2025'}
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
            {/* Generate Schedule Button - Admin Only */}
            {!event?.scheduleGenerated && (
              <button
                style={styles.scheduleButton}
                onClick={handleGenerateSchedule}
                disabled={loading}
              >
                <Calendar size={20} />
                <span>{loading ? 'Generating...' : '⚡ Generate Match Schedule'}</span>
              </button>
            )}

            {event?.scheduleGenerated && (
              <div style={{
                ...styles.scheduleButton,
                cursor: 'default',
                backgroundColor: '#10b981'
              }}>
                <Calendar size={20} />
                <span>✅ Schedule Generated</span>
              </div>
            )}

            {/* View Live Matches */}
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/EventMatches', { state: { event } })}
              style={{
                backgroundColor: '#b33b3bff',
                color: '#ffffffff',
                border: 'none',
              }}
            >
              View Live Matches
            </button>

            {/* Scorer Login */}
            <button 
              onClick={() => navigate('/ScorerDashboard', { state: { event } })}
              className="btn btn-primary"
            >
              Scorer Login
            </button>

            {/* View Registered Teams */}
            <button
              onClick={() => navigate(`/registered-teams/${event?._id}`)}
              className="btn btn-secondary btn-view-teams"
            >
              <Eye size={20} />
              <span>View All Registered Teams</span>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}