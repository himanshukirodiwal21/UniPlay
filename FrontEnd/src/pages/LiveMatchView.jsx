import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LiveMatchView() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000);
    return () => clearInterval(interval);
  }, [matchId]);

  const fetchLiveData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/live-matches/${matchId}`);
      const data = await response.json();

      if (data.success) {
        setLiveData(data.data);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error fetching live data:', err);
      setError('Failed to load live match data');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      padding: '20px',
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '20px',
      color: 'white',
    },
    teamSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
    },
    teamBox: {
      flex: 1,
      textAlign: 'center',
    },
    teamName: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    score: {
      fontSize: '3rem',
      fontWeight: 'bold',
    },
    vsText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: '0 20px',
    },
    infoCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    commentaryBox: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      maxHeight: '400px',
      overflowY: 'auto',
    },
    ballItem: {
      padding: '12px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    liveBadge: {
      background: '#ef4444',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      animation: 'pulse 2s infinite',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginTop: '20px',
    },
    statBox: {
      background: '#f3f4f6',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center',
    },
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={styles.container}>
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'white' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
            <h2>Loading Live Match...</h2>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !liveData) {
    return (
      <>
        <Header />
        <div style={styles.container}>
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'white' }}>
            <h2>❌ {error || 'Match not initialized yet'}</h2>
            <button
              onClick={() => navigate('/EventMatches')}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Back to Matches
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const currentInnings = liveData.innings[liveData.currentInnings - 1];
  const lastBalls = currentInnings?.ballByBall?.slice(-10).reverse() || [];

  return (
    <>
      <Header />
      <div style={styles.container}>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}
        </style>

        <div style={styles.content}>
          {/* Match Header */}
          <div style={styles.header}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ margin: 0 }}>🏏 Live Match</h1>
              <span style={styles.liveBadge}>● LIVE</span>
            </div>

            <div style={styles.teamSection}>
              {/* Team A */}
              <div style={styles.teamBox}>
                <div style={styles.teamName}>{liveData.teamA?.teamName || 'Team A'}</div>
                <div style={styles.score}>
                  {currentInnings?.battingTeam?.toString() === liveData.teamA?._id?.toString()
                    ? `${currentInnings.score}/${currentInnings.wickets}`
                    : liveData.innings[0]?.battingTeam?.toString() === liveData.teamA?._id?.toString()
                    ? `${liveData.innings[0].score}/${liveData.innings[0].wickets}`
                    : '-'}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  {currentInnings?.battingTeam?.toString() === liveData.teamA?._id?.toString()
                    ? `${currentInnings.overs} overs`
                    : ''}
                </div>
              </div>

              <div style={styles.vsText}>VS</div>

              {/* Team B */}
              <div style={styles.teamBox}>
                <div style={styles.teamName}>{liveData.teamB?.teamName || 'Team B'}</div>
                <div style={styles.score}>
                  {currentInnings?.battingTeam?.toString() === liveData.teamB?._id?.toString()
                    ? `${currentInnings.score}/${currentInnings.wickets}`
                    : liveData.innings[0]?.battingTeam?.toString() === liveData.teamB?._id?.toString()
                    ? `${liveData.innings[0].score}/${liveData.innings[0].wickets}`
                    : '-'}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  {currentInnings?.battingTeam?.toString() === liveData.teamB?._id?.toString()
                    ? `${currentInnings.overs} overs`
                    : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Current Batsmen */}
          {currentInnings?.currentBatsmen?.length > 0 && (
            <div style={styles.infoCard}>
              <h3 style={{ marginTop: 0 }}>🏏 Current Batsmen</h3>
              <div style={styles.statsGrid}>
                {currentInnings.currentBatsmen.map((batsman, idx) => (
                  <div key={idx} style={styles.statBox}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{batsman.player}</div>
                    <div style={{ fontSize: '1.5rem', margin: '10px 0' }}>
                      {batsman.runs} ({batsman.balls})
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      SR: {batsman.strikeRate.toFixed(2)} | 4s: {batsman.fours} | 6s: {batsman.sixes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Bowler */}
          {currentInnings?.currentBowler?.player && (
            <div style={styles.infoCard}>
              <h3 style={{ marginTop: 0 }}>⚾ Current Bowler</h3>
              <div style={styles.statBox}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {currentInnings.currentBowler.player}
                </div>
                <div style={{ fontSize: '1.5rem', margin: '10px 0' }}>
                  {currentInnings.currentBowler.wickets}/{currentInnings.currentBowler.runs}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  Overs: {currentInnings.currentBowler.overs} | Economy: {currentInnings.currentBowler.economy.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Ball-by-Ball Commentary */}
          <div style={styles.commentaryBox}>
            <h3 style={{ marginTop: 0 }}>💬 Ball-by-Ball Commentary</h3>
            {lastBalls.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>No balls bowled yet</p>
            ) : (
              lastBalls.map((ball, idx) => (
                <div key={idx} style={styles.ballItem}>
                  <div>
                    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>
                      Over {ball.over}
                    </span>
                    <span>{ball.commentary}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {ball.isWicket && (
                      <span style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}>
                        WICKET
                      </span>
                    )}
                    <span style={{
                      background: ball.runs >= 4 ? '#10b981' : '#3b82f6',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '50%',
                      fontWeight: 'bold',
                    }}>
                      {ball.runs}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}