// src/pages/LiveMatchView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BACKEND_URL = 'http://localhost:8000';

export default function LiveMatchView() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Auto-refresh every 3 seconds
  useEffect(() => {
    fetchLiveData();
    
    const interval = setInterval(() => {
      fetchLiveData();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [matchId]);

  const fetchLiveData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/live-matches/${matchId}`);
      const data = await response.json();

      if (data.success) {
        console.log('📊 Live data:', data.data);
        setLiveData(data.data);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('❌ Error:', err);
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
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: 'bold',
      animation: 'pulse 2s infinite',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
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
    runRateBox: {
      background: '#5d6b79ff',
      padding: '12px',
      borderRadius: '8px',
      marginTop: '15px',
      display: 'flex',
      justifyContent: 'space-around',
      fontSize: '0.9rem',

    },
    refreshIndicator: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#10b981',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: 'bold',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 1000,
      animation: 'pulse 2s infinite',
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
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
            <h2>{error || 'Match not initialized yet'}</h2>
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
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              ← Back to Matches
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ✅ FIXED: Get current innings
  const currentInnings = liveData.innings[liveData.currentInnings - 1];
  const lastBalls = currentInnings?.ballByBall?.slice(-10).reverse() || [];
  
  // ✅ FIXED: Calculate run rate
  const runRate = currentInnings?.overs > 0 
    ? (currentInnings.score / currentInnings.overs).toFixed(2) 
    : '0.00';

  // ✅ FIXED: Get team scores - SIMPLIFIED LOGIC
  const getTeamScore = (teamId) => {
    // Current innings batting team
    if (currentInnings?.battingTeam?._id?.toString() === teamId?.toString()) {
      return {
        score: currentInnings.score || 0,
        wickets: currentInnings.wickets || 0,
        overs: currentInnings.overs || 0,
        isBatting: true
      };
    }
    
    // Check if this team batted in first innings
    if (liveData.innings[0]?.battingTeam?._id?.toString() === teamId?.toString()) {
      return {
        score: liveData.innings[0].score || 0,
        wickets: liveData.innings[0].wickets || 0,
        overs: liveData.innings[0].overs || 0,
        isBatting: false
      };
    }
    
    // Team hasn't batted yet
    return { score: 0, wickets: 0, overs: 0, isBatting: false };
  };

  const teamAScore = getTeamScore(liveData.teamA?._id);
  const teamBScore = getTeamScore(liveData.teamB?._id);

  // ✅ DEBUG: Log scores
  console.log('Team A ID:', liveData.teamA?._id);
  console.log('Team B ID:', liveData.teamB?._id);
  console.log('Current Batting Team:', currentInnings?.battingTeam?._id);
  console.log('Team A Score:', teamAScore);
  console.log('Team B Score:', teamBScore);
  console.log('Current Innings Score:', currentInnings?.score);

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h1 style={{ margin: 0 }}>🏏 Live Match</h1>
              <span style={styles.liveBadge}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: 'white',
                  display: 'inline-block',
                  animation: 'pulse 2s infinite'
                }}></span>
                LIVE
              </span>
            </div>

            <div style={styles.teamSection}>
              {/* Team A */}
              <div style={styles.teamBox}>
                <div style={styles.teamName}>
                  {liveData.teamA?.teamName || 'Team A'}
                  {teamAScore.isBatting && ' *'}
                </div>
                <div style={styles.score}>
                  {teamAScore.score}/{teamAScore.wickets}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '5px' }}>
                  {teamAScore.overs > 0 ? `${teamAScore.overs} overs` : 'Yet to bat'}
                </div>
              </div>

              <div style={styles.vsText}>VS</div>

              {/* Team B */}
              <div style={styles.teamBox}>
                <div style={styles.teamName}>
                  {liveData.teamB?.teamName || 'Team B'}
                  {teamBScore.isBatting && ' *'}
                </div>
                <div style={styles.score}>
                  {teamBScore.score}/{teamBScore.wickets}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '5px' }}>
                  {teamBScore.overs > 0 ? `${teamBScore.overs} overs` : 'Yet to bat'}
                </div>
              </div>
            </div>

            {/* Run Rate */}
            <div style={styles.runRateBox}>
              <div>
                <strong>Current RR:</strong> {runRate}
              </div>
              <div>
                <strong>Innings:</strong> {liveData.currentInnings}/2
              </div>
              <div>
                <strong>Status:</strong> {
                  liveData.status === 'inProgress' ? 'In Progress' : 
                  liveData.status === 'innings1Complete' ? 'Innings Break' : 
                  liveData.status === 'completed' ? 'Match Completed' : 'Not Started'
                }
              </div>
            </div>

            {/* ✅ DEBUG INFO (Remove later) */}
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '10px', 
              borderRadius: '8px',
              marginTop: '10px',
              fontSize: '12px'
            }}>
              
            </div>
          </div>

          {/* Current Batsmen */}
          {currentInnings?.currentBatsmen?.length > 0 && (
            <div style={styles.infoCard}>
              <h3 style={{ marginTop: 0 }}>🏏 Current Batsmen</h3>
              <div style={styles.statsGrid}>
                {currentInnings.currentBatsmen.map((batsman, idx) => (
                  <div key={idx} style={styles.statBox}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
                      {batsman.player}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', margin: '10px 0' }}>
                      {batsman.runs}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      Balls: {batsman.balls} | SR: {batsman.strikeRate.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                      4s: {batsman.fours} | 6s: {batsman.sixes}
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
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
                  {currentInnings.currentBowler.player}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', margin: '10px 0' }}>
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
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>💬 Ball-by-Ball Commentary</h3>
            {lastBalls.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                No balls bowled yet. Waiting for first ball...
              </p>
            ) : (
              lastBalls.map((ball, idx) => (
                <div key={idx} style={styles.ballItem}>
                  <div style={{ flex: 1 }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      marginRight: '12px',
                      color: '#3b82f6'
                    }}>
                      Over {ball.over}
                    </span>
                    <span style={{ color: '#1f2937' }}>{ball.commentary}</span>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {ball.batsman} • {ball.bowler}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {ball.isWicket && (
                      <span style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}>
                        WICKET
                      </span>
                    )}
                    <span style={{
                      background: ball.runs >= 6 ? '#8b5cf6' :
                                 ball.runs === 4 ? '#3b82f6' : 
                                 ball.runs > 0 ? '#10b981' : '#6b7280',
                      color: 'white',
                      padding: '8px 14px',
                      borderRadius: '50%',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      minWidth: '40px',
                      textAlign: 'center',
                    }}>
                      {ball.runs}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Auto-refresh Indicator */}
        <div style={styles.refreshIndicator}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: 'white',
            display: 'inline-block',
          }}></span>
          Auto-updating every 3s
        </div>
      </div>
      <Footer />
    </>
  );
}