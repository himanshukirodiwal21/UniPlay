import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // You'll need react-router-dom
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
  const { id } = useParams(); // Gets the :id from the URL
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${BACKEND_URL}/api/v1/players/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Player not found`);
        }
        
        const data = await response.json();
        setPlayer(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]); // Re-fetch if the ID in the URL changes

  // Helper function to calculate average
  const getBattingAverage = () => {
    if (!player || !player.battingStats.outs || player.battingStats.outs === 0) {
      return (player?.battingStats?.totalRuns || 0).toFixed(2); // Show runs if no outs
    }
    return (player.battingStats.totalRuns / player.battingStats.outs).toFixed(2);
  };

  // Helper function to calculate strike rate
  const getStrikeRate = () => {
    if (!player || !player.battingStats.ballsFaced || player.battingStats.ballsFaced === 0) {
      return "0.00";
    }
    return ((player.battingStats.totalRuns / player.battingStats.ballsFaced) * 100).toFixed(2);
  };

  if (loading) {
    return <div style={styles.centered}>Loading player profile...</div>;
  }

  if (error) {
    return <div style={styles.centered}>{error}</div>;
  }

  if (!player) {
    return <div style={styles.centered}>Player data not available.</div>;
  }

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.profileCard}>
          {/* Profile Header */}
          <div style={styles.header}>
            <User size={60} color="#7c3aed" />
            <h1 style={styles.playerName}>{player.name}</h1>
            <div style={styles.teamInfo}>
              Team History: {player.teams?.map(t => t.teamName).join(', ') || 'N/A'}
            </div>
          </div>

          {/* Batting Stats */}
          <div style={styles.statsSection}>
            <h2 style={styles.sectionTitle}><BarChart2 /> Batting Career</h2>
            <div style={styles.statsGrid}>
              <StatBox label="Runs" value={player.battingStats.totalRuns} />
              <StatBox label="Balls Faced" value={player.battingStats.ballsFaced} />
              <StatBox label="Outs" value={player.battingStats.outs} />
              <StatBox label="Average" value={getBattingAverage()} />
              <StatBox label="Strike Rate" value={getStrikeRate()} />
              <StatBox label="50s" value={player.battingStats.fifties} />
              <StatBox label="100s" value={player.battingStats.hundreds} />
              <StatBox label="High Score" value={player.battingStats.highScore} />
            </div>
          </div>

          {/* Bowling Stats */}
          <div style={styles.statsSection}>
            <h2 style={styles.sectionTitle}><Zap /> Bowling Career</h2>
            <div style={styles.statsGrid}>
              <StatBox label="Wickets" value={player.bowlingStats.wicketsTaken} />
              <StatBox label="Balls Bowled" value={player.bowlingStats.ballsBowled} />
              <StatBox label="Runs Conceded" value={player.bowlingStats.runsConceded} />
              <StatBox label="5 Wkts" value={player.bowlingStats.fiveWicketHauls} />
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
  },
  container: {
    minHeight: 'calc(100vh - 120px)', // Adjust based on header/footer
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