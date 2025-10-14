import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MatchListing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live');

  const styles = {
    pageWrapper: {
    minHeight: '70vh',
    width: '100%',
    background: 'linear-gradient(135deg, rgb(75, 85, 99) 0%, rgb(107, 114, 128) 50%, rgb(156, 163, 175) 100%)',
    padding: '40px 20px',
  },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      
    },
    tabsContainer: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
    },
    tab: {
      flex: 1,
      padding: '12px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontWeight: '500',
      fontSize: '16px',
      background: 'white',
    },
    tabActive: {
      background: '#667eea',
      color: 'white',
      borderColor: '#667eea',
    },
    matchCard: {
      border: '2px solid #e0e0e0',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px',
      transition: 'all 0.3s',
      background: 'white',
      cursor: 'pointer',
    },
    matchHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
    },
    teamNames: {
      fontWeight: 'bold',
      fontSize: '18px',
      color: '#2c3e50',
    },
    liveBadge: {
      background: '#e74c3c',
      color: 'white',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      animation: 'pulse 2s infinite',
    },
    scoreLarge: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '10px',
    },
    matchInfo: {
      color: '#7f8c8d',
      fontSize: '14px',
    },
  };

  const liveMatches = [
    {
      id: 1,
      teamA: 'CSE XI',
      teamB: 'ECE Tigers',
      scoreA: '145/5 (18.3)',
      scoreB: '120/8 (17.2)',
      venue: 'College Ground',
      time: '2:30 PM',
      isLive: true,
    },
    {
      id: 2,
      teamA: 'Mech Warriors',
      teamB: 'IT Strikers',
      scoreA: '89/3 (12.4)',
      scoreB: 'Yet to bat',
      venue: 'Ground 2',
      time: '3:00 PM',
      isLive: true,
    },
  ];

  const upcomingMatches = [
    {
      id: 3,
      teamA: 'Civil Engineers',
      teamB: 'EEE Thunder',
      venue: 'College Ground',
      time: '5:00 PM',
      date: 'Tomorrow',
    },
  ];

  const completedMatches = [
    {
      id: 4,
      teamA: 'CSE XI',
      teamB: 'Mech Warriors',
      scoreA: '175/7 (20)',
      scoreB: '150/10 (18.4)',
      venue: 'College Ground',
      result: 'CSE XI won by 25 runs',
    },
  ];

  const handleMatchClick = (matchId) => {
    if (activeTab === 'live') {
      const match = liveMatches.find(m => m.id === matchId);
      navigate(`/live-match/${matchId}`, { state: { match } });
    } else if (activeTab === 'completed') {
      const match = completedMatches.find(m => m.id === matchId);
      navigate(`/match-result/${matchId}`, { state: { match } });
    } else if (activeTab === 'upcoming') {
      const match = upcomingMatches.find(m => m.id === matchId);
      // Upcoming match ke liye alag page ya alert
      alert('Match has not started yet!');
    }
  };

  const renderMatches = () => {
    if (activeTab === 'live') {
      return liveMatches.map((match) => (
        <div
          key={match.id}
          style={styles.matchCard}
          onClick={() => handleMatchClick(match.id)}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={styles.matchHeader}>
            <span style={styles.teamNames}>
              {match.teamA} vs {match.teamB}
            </span>
            <span style={styles.liveBadge}>🔴 LIVE</span>
          </div>
          <div style={styles.scoreLarge}>
            {match.scoreA} vs {match.scoreB}
          </div>
          <div style={styles.matchInfo}>
            📍 {match.venue} • {match.time}
          </div>
        </div>
      ));
    }

    if (activeTab === 'upcoming') {
      return upcomingMatches.map((match) => (
        <div
          key={match.id}
          style={styles.matchCard}
          onClick={() => handleMatchClick(match.id)}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={styles.matchHeader}>
            <span style={styles.teamNames}>
              {match.teamA} vs {match.teamB}
            </span>
          </div>
          <div style={styles.matchInfo}>
            📅 {match.date} • 📍 {match.venue} • {match.time}
          </div>
        </div>
      ));
    }

    if (activeTab === 'completed') {
      return completedMatches.map((match) => (
        <div
          key={match.id}
          style={styles.matchCard}
          onClick={() => handleMatchClick(match.id)}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={styles.matchHeader}>
            <span style={styles.teamNames}>
              {match.teamA} vs {match.teamB}
            </span>
          </div>
          <div style={styles.scoreLarge}>
            {match.scoreA} vs {match.scoreB}
          </div>
          <div style={{ ...styles.matchInfo, color: '#27ae60', fontWeight: '600' }}>
            ✅ {match.result}
          </div>
        </div>
      ));
    }
  };

  return (
    <>
      <Header />
      <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <style>
          {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
            }
            `}
        </style>

        <div style={styles.tabsContainer}>
          <div
            style={{
              ...styles.tab,
              ...(activeTab === 'live' ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab('live')}
          >
            🔴 LIVE
          </div>
          <div
            style={{
              ...styles.tab,
              ...(activeTab === 'upcoming' ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab('upcoming')}
          >
            📅 Upcoming
          </div>
          <div
            style={{
              ...styles.tab,
              ...(activeTab === 'completed' ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab('completed')}
          >
            ✅ Completed
          </div>
        </div>

        {renderMatches()}
      </div>
      </div>
      <Footer />
    </>
  );
}