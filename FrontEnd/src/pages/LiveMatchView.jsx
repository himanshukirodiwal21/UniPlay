// src/pages/LiveMatchView.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LiveMatchView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchId } = useParams();
  const match = location.state?.match;

  const [activeTab, setActiveTab] = useState('commentary');

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #9ca3af 100%)',
      paddingBottom: '40px',
    },
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '40px 20px',
    },
    matchHeader: {
      textAlign: 'center',
      marginBottom: '30px',
      background: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    matchTitle: {
      color: '#1f2937',
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '15px',
    },
    liveBadge: {
      background: '#ef4444',
      color: 'white',
      padding: '10px 24px',
      borderRadius: '24px',
      fontSize: '14px',
      fontWeight: 'bold',
      display: 'inline-block',
      animation: 'pulse 2s infinite',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
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
      marginBottom: '10px',
      fontSize: '16px',
      color: '#374151',
    },
    scoreLarge: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px',
    },
    scoreInfo: {
      color: '#6b7280',
      fontSize: '15px',
    },
    commentary: {
      background: '#f8f9fa',
      borderLeft: '5px solid #3b82f6',
      padding: '15px',
      marginBottom: '12px',
      borderRadius: '8px',
      fontSize: '15px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '15px',
      marginBottom: '25px',
    },
    statBox: {
      background: '#f8f9fa',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    statLabel: {
      fontSize: '13px',
      color: '#6b7280',
      marginBottom: '8px',
    },
    statValue: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: '#1f2937',
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '25px',
    },
    tab: {
      flex: 1,
      padding: '12px',
      border: '2px solid #e0e0e0',
      borderRadius: '10px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
      background: 'white',
      fontWeight: '500',
    },
    tabActive: {
      background: '#667eea',
      color: 'white',
      borderColor: '#667eea',
    },
  };

  return (
    <>
      <Header />
      <div style={styles.pageContainer}>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}
        </style>

        <div style={styles.container}>
          <div style={styles.matchHeader}>
            <h3 style={styles.matchTitle}>
              CSE XI vs ECE Tigers
            </h3>
            <span style={styles.liveBadge}>🔴 LIVE</span>
          </div>

          <div style={styles.scoreDisplay}>
            <div style={styles.teamName}>CSE XI</div>
            <div style={styles.scoreLarge}>145/5</div>
            <div style={styles.scoreInfo}>18.3 overs • RR: 7.89</div>
          </div>

          <div style={styles.tabs}>
            <div
              style={{
                ...styles.tab,
                ...(activeTab === 'commentary' ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab('commentary')}
            >
              Commentary
            </div>
            <div
              style={{
                ...styles.tab,
                ...(activeTab === 'stats' ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab('stats')}
            >
              Stats
            </div>
          </div>

          {activeTab === 'commentary' && (
            <>
              <div style={styles.commentary}>
                <strong>18.3</strong> • Ravi hits a FOUR! ⚡
              </div>
              <div style={styles.commentary}>
                <strong>18.2</strong> • Single taken by Amit
              </div>
              <div style={styles.commentary}>
                <strong>18.1</strong> • Dot ball
              </div>
            </>
          )}

          {activeTab === 'stats' && (
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Batsman: Ravi</div>
                <div style={styles.statValue}>45 (30)</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Bowler: Shyam</div>
                <div style={styles.statValue}>3/28 (4)</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}