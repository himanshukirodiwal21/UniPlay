import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';

export default function EventLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

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
      gap: '20px',
      justifyContent: 'center',
      marginTop: '40px',
      padding: '0 20px',
    },
    button: {
      background: 'white',
      color: '#374151',
      border: 'none',
      padding: '18px 40px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '1.1rem',
      boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
      transition: 'all 0.3s',
    },
    buttonScorer: {
      background: '#dc2626',
      color: 'white',
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
            <button 
              style={styles.button}
              onClick={() => navigate('/EventMatches', { state: { event } })}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
              }}
            >
              View Live Matches
            </button>
            <button 
              style={{...styles.button, ...styles.buttonScorer}}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
                e.target.style.background = '#b91c1c';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
                e.target.style.background = '#dc2626';
              }}
            >
              Scorer Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}