// src/pages/MatchResult.jsx
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MatchResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchId } = useParams();
  const match = location.state?.match;

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #9ca3af 100%)',
      paddingBottom: '40px',
    },
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
    },
    winnerBanner: {
      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      color: 'white',
      padding: '25px',
      borderRadius: '12px',
      textAlign: 'center',
      marginBottom: '25px',
      fontSize: '1.8rem',
      fontWeight: 'bold',
      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    },
    scoreDisplay: {
      background: '#f8f9fa',
      padding: '25px',
      borderRadius: '12px',
      marginBottom: '20px',
      borderLeft: '6px solid #667eea',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    teamName: {
      fontWeight: 'bold',
      marginBottom: '8px',
      fontSize: '16px',
      color: '#374151',
    },
    scoreLarge: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
    },
    motmCard: {
      background: '#fff3cd',
      borderLeft: '5px solid #f59e0b',
      padding: '20px',
      borderRadius: '10px',
      marginTop: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    motmTitle: {
      fontWeight: 'bold',
      marginBottom: '8px',
      fontSize: '14px',
      color: '#92400e',
    },
    motmDetails: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#78350f',
    },
  };

  return (
    <>
      <Header />
      <div style={styles.pageContainer}>
        <div style={styles.container}>
          <div style={styles.winnerBanner}>
            🏆 CSE XI Won by 25 runs!
          </div>

          <div style={styles.scoreDisplay}>
            <div style={styles.teamName}>CSE XI</div>
            <div style={styles.scoreLarge}>175/7 (20)</div>
          </div>

          <div style={styles.scoreDisplay}>
            <div style={styles.teamName}>ECE Tigers</div>
            <div style={styles.scoreLarge}>150/10 (18.4)</div>
          </div>

          <div style={styles.motmCard}>
            <div style={styles.motmTitle}>🌟 Man of the Match</div>
            <div style={styles.motmDetails}>Ravi - 75 runs (45 balls)</div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}