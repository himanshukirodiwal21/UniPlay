import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { User, BarChart2, Zap } from "lucide-react";

const BACKEND_URL = "http://localhost:8000";

// A small component for displaying a stat
const StatBox = ({ label, value }) => (
  <div style={styles.statBox}>
    <div style={styles.statValue}>{value || 0}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

export default function PlayerProfile() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching player ID:', id);
        console.log('🔍 Full URL:', `${BACKEND_URL}/api/v1/players/${id}`);
        
        const response = await fetch(`${BACKEND_URL}/api/v1/players/${id}`);
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Error response:', errorData);
          throw new Error(`Player not found. Make sure this ID exists in database.`);
        }
        
        const data = await response.json();
        console.log('✅ Full API response:', data);
        console.log('✅ Player data:', data.data);
        console.log('✅ Batting stats:', data.data?.battingStats);
        console.log('✅ Bowling stats:', data.data?.bowlingStats);
        
        setPlayer(data.data);
      } catch (err) {
        console.error('❌ Full error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlayer();
    } else {
      setError('No player ID in URL');
      setLoading(false);
    }
  }, [id]);

  // Helper function to calculate average
  const getBattingAverage = () => {
    // ✅ Safe checks with optional chaining
    if (!player?.battingStats?.outs || player.battingStats.outs === 0) {
      return (player?.battingStats?.totalRuns || 0).toFixed(2);
    }
    return (player.battingStats.totalRuns / player.battingStats.outs).toFixed(2);
  };

  // Helper function to calculate strike rate
  const getStrikeRate = () => {
    // ✅ Safe checks with optional chaining
    if (!player?.battingStats?.ballsFaced || player.battingStats.ballsFaced === 0) {
      return "0.00";
    }
    return ((player.battingStats.totalRuns / player.battingStats.ballsFaced) * 100).toFixed(2);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={styles.centered}>Loading player profile...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={styles.centered}>
          <div style={styles.errorBox}>
            <h2 style={{ fontSize: '24px', color: '#dc2626', marginBottom: '16px', fontWeight: 'bold' }}>
              ❌ Player Not Found
            </h2>
            <p style={{ fontSize: '16px', marginBottom: '20px', color: '#374151' }}>{error}</p>
            <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '8px', textAlign: 'left', border: '1px solid #fecaca' }}>
              <strong>📋 Debugging Steps:</strong>
              <ol style={{ marginTop: '12px', marginLeft: '20px', lineHeight: '1.8', color: '#374151' }}>
                <li>Open Console (F12) - check logged ID and URL</li>
                <li>Go to: <code style={{ background: '#fee', padding: '2px 6px', borderRadius: '4px' }}>http://localhost:8000/api/v1/players</code></li>
                <li>Copy a real player ID from response</li>
                <li>Use that ID in URL: <code style={{ background: '#fee', padding: '2px 6px', borderRadius: '4px' }}>/players/REAL_ID_HERE</code></li>
              </ol>
              <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
                Current ID in URL: <strong style={{ color: '#dc2626' }}>{id || 'MISSING'}</strong>
              </p>
            </div>
            <button 
              style={styles.backButton}
              onClick={() => window.history.back()}
            >
              ← Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!player) {
    return (
      <>
        <Header />
        <div style={styles.centered}>Player data not available.</div>
        <Footer />
      </>
    );
  }

  // ✅ Safe data extraction with defaults
  const battingStats = player.battingStats || {};
  const bowlingStats = player.bowlingStats || {};
  const teams = player.teams || [];

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.profileCard}>
          {/* Profile Header */}
          <div style={styles.header}>
            <User size={60} color="#7c3aed" />
            <h1 style={styles.playerName}>{player.name || 'Unknown Player'}</h1>
            <div style={styles.teamInfo}>
              Team History: {teams.length > 0 ? teams.map(t => t.teamName).join(', ') : 'No teams yet'}
            </div>
          </div>

          {/* Batting Stats */}
          <div style={styles.statsSection}>
            <h2 style={styles.sectionTitle}><BarChart2 /> Batting Career</h2>
            <div style={styles.statsGrid}>
              <StatBox label="Runs" value={battingStats.totalRuns || 0} />
              <StatBox label="Balls Faced" value={battingStats.ballsFaced || 0} />
              <StatBox label="Outs" value={battingStats.outs || 0} />
              <StatBox label="Average" value={getBattingAverage()} />
              <StatBox label="Strike Rate" value={getStrikeRate()} />
              <StatBox label="50s" value={battingStats.fifties || 0} />
              <StatBox label="100s" value={battingStats.hundreds || 0} />
              <StatBox label="High Score" value={battingStats.highScore || 0} />
            </div>
          </div>

          {/* Bowling Stats */}
          <div style={styles.statsSection}>
            <h2 style={styles.sectionTitle}><Zap /> Bowling Career</h2>
            <div style={styles.statsGrid}>
              <StatBox label="Wickets" value={bowlingStats.wicketsTaken || 0} />
              <StatBox label="Balls Bowled" value={bowlingStats.ballsBowled || 0} />
              <StatBox label="Runs Conceded" value={bowlingStats.runsConceded || 0} />
              <StatBox label="5 Wkts" value={bowlingStats.fiveWicketHauls || 0} />
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}

// --- STYLES ---
const styles = {
  centered: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    background: 'linear-gradient(135deg, rgb(243, 244, 246) 0%, rgb(229, 231, 235) 100%)',
  },
  errorBox: {
    maxWidth: '600px',
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  backButton: {
    marginTop: '20px',
    padding: '12px 24px',
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  container: {
    minHeight: 'calc(100vh - 120px)',
    background: 'linear-gradient(135deg, rgb(243, 244, 246) 0%, rgb(229, 231, 235) 100%)',
    padding: '32px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  profileCard: {
    width: '100%',
    maxWidth: '900px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  header: {
    background: '#f8f9fa',
    borderBottom: '2px solid #e5e7eb',
    padding: '32px',
    textAlign: 'center',
  },
  playerName: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '12px 0 4px 0',
  },
  teamInfo: {
    fontSize: '16px',
    color: '#6b7280',
  },
  statsSection: {
    padding: '32px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    borderBottom: '2px solid #7c3aed',
    paddingBottom: '8px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '20px',
  },
  statBox: {
    background: '#f8f9fa',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px',
  },
};