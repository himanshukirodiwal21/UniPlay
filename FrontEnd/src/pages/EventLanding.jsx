import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header'; // Adjust path as needed
import Footer from '../components/Footer'; // Adjust path as needed
import ScorerDashboard from './ScorerDashboard'; // This import might be for type-checking or context
import { Eye } from 'lucide-react'; // Make sure you have 'lucide-react' installed

export default function EventLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  // Inline styles for the page layout
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
      flexWrap: 'wrap', // Allows buttons to wrap on smaller screens
      gap: '20px',
      justifyContent: 'center',
      marginTop: '40px',
      padding: '0 20px',
    },
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.heroContainer}>
          <div style={styles.hero}>
            <h1 style={styles.title}>
              🏆 College Cricket Tournament 2025
            </h1>
            <p style={styles.subtitle}>
              Live scoring • Real-time updates • Complete statistics
            </p>
          </div>

          <div style={styles.buttonContainer}>
            {/* Button 1: Uses .btn-secondary from style.css */}
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

            {/* Button 2: Uses .btn-primary from style.css */}
            <button 
              onClick={() => navigate('/ScorerDashboard', { state: { event } })}
              className="btn btn-primary"
            >
              Scorer Login
            </button>

            {/* Button 3: Uses .btn-secondary from style.css */}
            <button
              onClick={() => navigate(`/registered-teams/${event._id}`)}
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