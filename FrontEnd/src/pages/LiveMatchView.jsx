// src/pages/LiveMatchView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Activity, Target, Zap, Clock, BarChart3, ArrowLeft, Award, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BACKEND_URL = 'http://localhost:8000';

export default function LiveMatchView() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  
  const [liveData, setLiveData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [lastPredictionTime, setLastPredictionTime] = useState(0);

  useEffect(() => {
    fetchLiveData();
    
    const interval = setInterval(() => {
      fetchLiveData();
    }, 30000);

    return () => clearInterval(interval);
  }, [matchId]);

  const fetchLiveData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/live-matches/${matchId}`);
      const data = await response.json();

      if (data.success) {
        setLiveData(data.data);
        setError(null);
        
        const now = Date.now();
        if (!prediction || now - lastPredictionTime > 30000) {
          fetchPrediction(data.data);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load live match data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async (matchData) => {
    if (predictionLoading) return;
    
    setPredictionLoading(true);
    setLastPredictionTime(Date.now());
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/predict-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matchData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Prediction Response:', data);
      
      if (!data.success || !data.data) {
        throw new Error("No prediction data in response");
      }

      const parsed = data.data;
      
      if (!parsed.winProbability || 
          typeof parsed.winProbability.teamA !== 'number' || 
          typeof parsed.winProbability.teamB !== 'number') {
        throw new Error("Invalid prediction format");
      }
      
      console.log('Setting prediction:', parsed);
      setPrediction(parsed);
      
    } catch (err) {
      console.error('Prediction error:', err);
      
      const currentInnings = matchData.innings[matchData.currentInnings - 1];
      
      setPrediction({
        winProbability: { teamA: 50, teamB: 50 },
        predictedScore: currentInnings?.score || 0,
        keyFactors: [
          "Prediction temporarily unavailable",
          "Match situation being analyzed",
          "Try refreshing in a moment"
        ],
        momentum: "neutral",
        confidence: "low",
        reasoning: "Unable to generate detailed prediction at this moment"
      });
    } finally {
      setPredictionLoading(false);
    }
  };

  const getTeamScore = (teamId, matchData) => {
    const currentInnings = matchData.innings[matchData.currentInnings - 1];
    
    if (currentInnings?.battingTeam?._id?.toString() === teamId?.toString()) {
      return {
        score: currentInnings.score || 0,
        wickets: currentInnings.wickets || 0,
        overs: currentInnings.overs || 0,
        isBatting: true
      };
    }
    
    if (matchData.innings[0]?.battingTeam?._id?.toString() === teamId?.toString()) {
      return {
        score: matchData.innings[0].score || 0,
        wickets: matchData.innings[0].wickets || 0,
        overs: matchData.innings[0].overs || 0,
        isBatting: false
      };
    }
    
    return { score: 0, wickets: 0, overs: 0, isBatting: false };
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a237e 25%, #0d47a1 50%, #1a237e 75%, #0a0e27 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
      pointerEvents: 'none',
    },
    loadingContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a237e 50%, #0a0e27 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingContent: {
      textAlign: 'center',
    },
    spinner: {
      width: '4rem',
      height: '4rem',
      border: '4px solid rgba(59, 130, 246, 0.3)',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      margin: '0 auto 1rem',
      animation: 'spin 1s linear infinite',
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    backButton: {
      padding: '0.75rem 1.25rem',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    },
    liveBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '9999px',
      fontWeight: 'bold',
      boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
      animation: 'pulse 2s infinite',
      border: '2px solid rgba(255, 255, 255, 0.3)',
    },
    liveDot: {
      width: '0.75rem',
      height: '0.75rem',
      background: 'white',
      borderRadius: '50%',
      animation: 'ping 2s infinite',
      boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
    },
    scoreCard: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden',
    },
    scoreCardGlow: {
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
      animation: 'rotate 20s linear infinite',
    },
    teamGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      alignItems: 'center',
      position: 'relative',
      zIndex: 1,
    },
    teamSection: {
      textAlign: 'center',
    },
    teamName: {
      color: 'rgba(255,255,255,0.95)',
      fontSize: '1.4rem',
      fontWeight: '700',
      marginBottom: '0.75rem',
      textShadow: '0 2px 10px rgba(0,0,0,0.3)',
    },
    teamScore: {
      color: 'white',
      fontSize: '4rem',
      fontWeight: '900',
      marginBottom: '0.5rem',
      textShadow: '0 4px 20px rgba(0,0,0,0.4)',
      letterSpacing: '-0.02em',
    },
    teamOvers: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: '0.95rem',
      fontWeight: '500',
    },
    vsSection: {
      textAlign: 'center',
      position: 'relative',
    },
    vsText: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: '2.5rem',
      fontWeight: '900',
      textShadow: '0 2px 15px rgba(0,0,0,0.3)',
    },
    inningsBox: {
      marginTop: '1rem',
      background: 'rgba(255,255,255,0.25)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    },
    statsBar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem',
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '2px solid rgba(255,255,255,0.25)',
      position: 'relative',
      zIndex: 1,
    },
    statItem: {
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '1rem',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    statLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: '0.85rem',
      marginBottom: '0.5rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    statValue: {
      color: 'white',
      fontSize: '1.75rem',
      fontWeight: 'bold',
      textShadow: '0 2px 10px rgba(0,0,0,0.3)',
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
    },
    card: {
      background: 'rgba(255,255,255,0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
      marginBottom: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      transition: 'transform 0.3s, box-shadow 0.3s',
    },
    cardTitle: {
      fontSize: '1.4rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginTop: 0,
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #e5e7eb',
    },
    batsmenGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    batsmanCard: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #e9d5ff 100%)',
      padding: '1.25rem',
      borderRadius: '12px',
      border: '2px solid rgba(59, 130, 246, 0.3)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    },
    batsmanHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start',
      marginBottom: '1rem',
    },
    batsmanName: {
      fontWeight: 'bold',
      color: '#1f2937',
      fontSize: '1.1rem',
    },
    batsmanRuns: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#2563eb',
      lineHeight: 1,
    },
    batsmanStats: {
      fontSize: '0.875rem',
      color: '#4b5563',
      lineHeight: 1.6,
    },
    bowlerCard: {
      background: 'linear-gradient(135deg, #fee2e2 0%, #fed7aa 100%)',
      padding: '1.25rem',
      borderRadius: '12px',
      border: '2px solid rgba(220, 38, 38, 0.3)',
    },
    // FIXED: Combined Card for Last 6 Balls + Commentary
    ballsAndCommentaryCard: {
      background: 'rgba(255,255,255,0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
      marginBottom: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      transition: 'transform 0.3s, box-shadow 0.3s',
    },
    ballsContainer: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'flex-start',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      padding: '0.5rem 0',
      marginBottom: '0',
    },
    ballCircle: {
      minWidth: '2.25rem',
      width: '2.25rem',
      height: '2.25rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      color: 'white',
      fontSize: '0.95rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'transform 0.2s',
      cursor: 'pointer',
      border: '2px solid rgba(255, 255, 255, 0.4)',
      flexShrink: 0,
    },
    commentaryDivider: {
      height: '2px',
      background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)',
      margin: '1.5rem 0 1rem 0',
    },
    commentarySection: {
      maxHeight: '400px',
      overflowY: 'auto',
    },
    commentaryItem: {
      borderLeft: '3px solid #3b82f6',
      paddingLeft: '0.875rem',
      paddingTop: '0.625rem',
      paddingBottom: '0.625rem',
      marginBottom: '0.875rem',
      background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)',
      borderRadius: '0 8px 8px 0',
      transition: 'all 0.2s',
    },
    predictionCard: {
      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.95) 0%, rgba(219, 39, 119, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 20px 40px rgba(147, 51, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
      color: 'white',
      marginBottom: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      position: 'relative',
      overflow: 'hidden',
    },
    predictionGlow: {
      position: 'absolute',
      top: '-50%',
      right: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
      animation: 'rotate 15s linear infinite',
    },
    predictionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.5rem',
      position: 'relative',
      zIndex: 1,
    },
    refreshButton: {
      padding: '0.5rem 1rem',
      background: 'rgba(255,255,255,0.25)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      borderRadius: '8px',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s',
      backdropFilter: 'blur(10px)',
    },
    probabilityBar: {
      background: 'rgba(255,255,255,0.25)',
      borderRadius: '9999px',
      height: '1rem',
      overflow: 'hidden',
      marginTop: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      position: 'relative',
    },
    probabilityFill: {
      background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
      height: '100%',
      borderRadius: '9999px',
      transition: 'width 0.8s ease-out',
      boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
    },
    factorBox: {
      background: 'rgba(255,255,255,0.15)',
      borderRadius: '8px',
      padding: '0.75rem',
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(10px)',
      lineHeight: 1.5,
    },
    autoUpdateBadge: {
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '9999px',
      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      zIndex: 1000,
      animation: 'pulse 2s infinite',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(10px)',
    },
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={styles.loadingContainer}>
          <style>
            {`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
              @keyframes ping {
                75%, 100% {
                  transform: scale(2);
                  opacity: 0;
                }
              }
              @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              /* Custom Scrollbar for Commentary */
              .commentary-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .commentary-scroll::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.05);
                border-radius: 10px;
              }
              .commentary-scroll::-webkit-scrollbar-thumb {
                background: rgba(59, 130, 246, 0.5);
                borderRadius: 10px;
              }
              .commentary-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(59, 130, 246, 0.7);
              }
            `}
          </style>
          <div style={styles.loadingContent}>
            <div style={styles.spinner}></div>
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
              Loading Live Match...
            </h2>
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
        <div style={styles.loadingContainer}>
          <div style={styles.loadingContent}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>
              {error || 'Match not initialized yet'}
            </h2>
            <button
              onClick={() => navigate('/EventMatches')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
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

  const currentInnings = liveData.innings[liveData.currentInnings - 1];
  const lastBalls = currentInnings?.ballByBall?.slice(-6).reverse() || [];
  const fullCommentary = currentInnings?.ballByBall?.slice().reverse() || [];
  
  const runRate = currentInnings?.overs > 0 
    ? (currentInnings.score / currentInnings.overs).toFixed(2) 
    : '0.00';

  const teamAScore = getTeamScore(liveData.teamA?._id, liveData);
  const teamBScore = getTeamScore(liveData.teamB?._id, liveData);

  const requiredRunRate = liveData.currentInnings === 2 && liveData.innings[0]?.score && (liveData.totalOvers - currentInnings.overs) > 0
    ? ((liveData.innings[0].score + 1 - currentInnings.score) / (liveData.totalOvers - currentInnings.overs)).toFixed(2)
    : '-';

  return (
    <>
      <Header />
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @media (max-width: 1024px) {
            .main-grid {
              grid-template-columns: 1fr !important;
            }
            .team-grid {
              grid-template-columns: 1fr !important;
            }
            .batsmen-grid {
              grid-template-columns: 1fr !important;
            }
          }
          .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 15px 50px rgba(0,0,0,0.2);
          }
          .batsman-card:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
          }
          .ball-circle:hover {
            transform: scale(1.1);
          }
          .commentary-item:hover {
            background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%);
            border-left-width: 4px;
          }
          /* Custom Scrollbar */
          .commentary-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .commentary-scroll::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.05);
            border-radius: 10px;
          }
          .commentary-scroll::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.5);
            border-radius: 10px;
          }
          .commentary-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(59, 130, 246, 0.7);
          }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <div style={styles.content}>
          
          {/* Top Bar */}
          <div style={styles.topBar}>
            <button
              style={styles.backButton}
              onClick={() => navigate('/')}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateX(-4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div style={styles.liveBadge}>
              <div style={styles.liveDot}></div>
              LIVE
            </div>
          </div>

          {/* Main Score Card */}
          <div style={styles.scoreCard}>
            <div style={styles.scoreCardGlow}></div>
            <div style={styles.teamGrid} className="team-grid">
              
              {/* Team A */}
              <div style={styles.teamSection}>
                <div style={styles.teamName}>
                  {liveData.teamA?.teamName || 'Team A'}
                  {teamAScore.isBatting && <span style={{color: '#fbbf24', fontSize: '1.2rem'}}> ⚡</span>}
                </div>
                <div style={styles.teamScore}>
                  {teamAScore.score}/{teamAScore.wickets}
                </div>
                <div style={styles.teamOvers}>
                  {teamAScore.overs > 0 ? `${teamAScore.overs} overs` : 'Yet to bat'}
                </div>
              </div>

              {/* VS */}
              <div style={styles.vsSection}>
                <div style={styles.vsText}>VS</div>
                <div style={styles.inningsBox}>
                  <div style={{color: 'rgba(255,255,255,0.95)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                    Innings {liveData.currentInnings}/2
                  </div>
                  <div style={{color: 'white', fontSize: '0.95rem', fontWeight: '600'}}>
                    {liveData.status === 'inProgress' ? '🏏 In Progress' : 
                     liveData.status === 'innings1Complete' ? '⏸️ Innings Break' :
                     liveData.status === 'completed' ? '✅ Completed' : '⏳ Not Started'}
                  </div>
                </div>
              </div>

              {/* Team B */}
              <div style={styles.teamSection}>
                <div style={styles.teamName}>
                  {liveData.teamB?.teamName || 'Team B'}
                  {teamBScore.isBatting && <span style={{color: '#fbbf24', fontSize: '1.2rem'}}> ⚡</span>}
                </div>
                <div style={styles.teamScore}>
                  {teamBScore.score}/{teamBScore.wickets}
                </div>
                <div style={styles.teamOvers}>
                  {teamBScore.overs > 0 ? `${teamBScore.overs} overs` : 'Yet to bat'}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div style={styles.statsBar}>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Current RR</div>
                <div style={styles.statValue}>{runRate}</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Overs Left</div>
                <div style={styles.statValue}>
                  {liveData.totalOvers - (currentInnings?.overs || 0)}
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Required RR</div>
                <div style={styles.statValue}>{requiredRunRate}</div>
              </div>
            </div>
          </div>

          <div style={styles.mainGrid} className="main-grid">
            
            {/* Left Column */}
            <div>
              
              {/* Current Batsmen */}
              {currentInnings?.currentBatsmen?.length > 0 && (
                <div style={styles.card} className="card">
                  <h3 style={styles.cardTitle}>
                    <Activity color="#2563eb" size={26} />
                    Current Batsmen
                  </h3>
                  <div style={styles.batsmenGrid} className="batsmen-grid">
                    {currentInnings.currentBatsmen.map((batsman, idx) => (
                      <div key={idx} style={styles.batsmanCard} className="batsman-card">
                        <div style={styles.batsmanHeader}>
                          <div style={styles.batsmanName}>{batsman.player}</div>
                          <div style={styles.batsmanRuns}>{batsman.runs}</div>
                        </div>
                        <div style={styles.batsmanStats}>
                          <div style={{marginBottom: '0.25rem'}}>
                            <strong>Balls:</strong> {batsman.balls} • <strong>SR:</strong> {batsman.strikeRate.toFixed(1)}
                          </div>
                          <div>
                            <strong>4s:</strong> {batsman.fours} • <strong>6s:</strong> {batsman.sixes}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Bowler */}
              {currentInnings?.currentBowler?.player && (
                <div style={styles.card} className="card">
                  <h3 style={styles.cardTitle}>
                    <Target color="#dc2626" size={26} />
                    Current Bowler
                  </h3>
                  <div style={styles.bowlerCard}>
                    <div style={styles.batsmanHeader}>
                      <div style={styles.batsmanName}>{currentInnings.currentBowler.player}</div>
                      <div style={{...styles.batsmanRuns, color: '#dc2626'}}>
                        {currentInnings.currentBowler.wickets}/{currentInnings.currentBowler.runs}
                      </div>
                    </div>
                    <div style={styles.batsmanStats}>
                      <div style={{marginBottom: '0.25rem'}}>
                        <strong>Overs:</strong> {currentInnings.currentBowler.overs}
                      </div>
                      <div>
                        <strong>Economy:</strong> {currentInnings.currentBowler.economy.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FIXED: Combined Last 6 Balls + Commentary in ONE Card */}
              <div style={styles.ballsAndCommentaryCard} className="card">
                {/* Last 6 Balls Section */}
                <h3 style={styles.cardTitle}>
                  <Zap color="#ca8a04" size={26} />
                  Last 6 Balls
                </h3>
                {lastBalls.length === 0 ? (
                  <p style={{textAlign: 'center', color: '#6b7280', padding: '1rem', fontSize: '0.95rem'}}>
                    ⏳ Waiting for first ball...
                  </p>
                ) : (
                  <div style={styles.ballsContainer}>
                    {lastBalls.map((ball, idx) => (
                      <div
                        key={idx}
                        className="ball-circle"
                        style={{
                          ...styles.ballCircle,
                          background: ball.isWicket ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                      ball.runs >= 6 ? 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' :
                                      ball.runs === 4 ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                                      ball.runs > 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                                      'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                        }}
                      >
                        {ball.isWicket ? 'W' : ball.runs}
                      </div>
                    ))}
                  </div>
                )}

                {/* Divider */}
                <div style={styles.commentaryDivider}></div>

                {/* Ball-by-Ball Commentary Section */}
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
                  <Clock color="#059669" size={24} />
                  <h4 style={{margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937'}}>
                    Ball-by-Ball Commentary
                  </h4>
                </div>
                
                {fullCommentary.length === 0 ? (
                  <p style={{textAlign: 'center', color: '#6b7280', padding: '1rem', fontSize: '0.95rem'}}>
                    💬 No commentary yet
                  </p>
                ) : (
                  <div style={styles.commentarySection} className="commentary-scroll">
                    {fullCommentary.map((ball, idx) => (
                      <div key={idx} style={styles.commentaryItem} className="commentary-item">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.4rem'}}>
                          <span style={{fontWeight: 'bold', color: '#2563eb', fontSize: '0.85rem'}}>
                            📍 Over {ball.over}
                          </span>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            background: ball.isWicket ? '#fee2e2' :
                                        ball.runs >= 6 ? '#f3e8ff' :
                                        ball.runs === 4 ? '#dbeafe' :
                                        '#f3f4f6',
                            color: ball.isWicket ? '#991b1b' :
                                   ball.runs >= 6 ? '#6b21a8' :
                                   ball.runs === 4 ? '#1e40af' :
                                   '#374151',
                            border: '1px solid ' + (ball.isWicket ? '#fecaca' :
                                   ball.runs >= 6 ? '#e9d5ff' :
                                   ball.runs === 4 ? '#bfdbfe' :
                                   '#e5e7eb')
                          }}>
                            {ball.isWicket ? '🔴 WICKET' : `${ball.runs} Run${ball.runs !== 1 ? 's' : ''}`}
                          </span>
                        </div>
                        <p style={{color: '#374151', fontSize: '0.875rem', margin: '0.4rem 0', lineHeight: 1.5, fontWeight: '500'}}>
                          {ball.commentary}
                        </p>
                        <p style={{color: '#6b7280', fontSize: '0.75rem', margin: 0, fontWeight: '600'}}>
                          🏏 {ball.batsman} • ⚾ {ball.bowler}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div>
              
              {/* AI Prediction */}
              <div style={styles.predictionCard}>
                <div style={styles.predictionGlow}></div>
                <div style={styles.predictionHeader}>
                  <h3 style={{margin: 0, fontSize: '1.4rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <TrendingUp size={26} />
                    AI Prediction
                  </h3>
                  <button
                    onClick={() => fetchPrediction(liveData)}
                    disabled={predictionLoading}
                    style={{
                      ...styles.refreshButton,
                      opacity: predictionLoading ? 0.6 : 1,
                      cursor: predictionLoading ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => !predictionLoading && (e.target.style.background = 'rgba(255,255,255,0.35)')}
                    onMouseLeave={(e) => !predictionLoading && (e.target.style.background = 'rgba(255,255,255,0.25)')}
                  >
                    {predictionLoading ? '⏳' : '🔄 Refresh'}
                  </button>
                </div>

                {predictionLoading ? (
                  <div style={{textAlign: 'center', padding: '2rem', position: 'relative', zIndex: 1}}>
                    <div style={{...styles.spinner, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white'}}></div>
                    <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem', fontWeight: '600'}}>
                      🤖 Analyzing match data...
                    </p>
                  </div>
                ) : !prediction ? (
                  <div style={{textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.9)', position: 'relative', zIndex: 1}}>
                    <BarChart3 size={56} style={{margin: '0 auto 1rem', opacity: 0.7}} />
                    <p style={{fontSize: '1.05rem', fontWeight: '600'}}>Loading prediction...</p>
                  </div>
                ) : (
                  <div style={{position: 'relative', zIndex: 1}}>
                    {/* Win Probability */}
                    <div style={{marginBottom: '1.25rem'}}>
                      <div style={{color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <Award size={18} />
                        Win Probability
                      </div>
                      <div style={{marginBottom: '1rem'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                          <span style={{fontWeight: '700', fontSize: '1.05rem'}}>{liveData.teamA?.teamName}</span>
                          <span style={{fontWeight: 'bold', fontSize: '1.25rem'}}>
                            {isNaN(prediction.winProbability.teamA) ? '0' : prediction.winProbability.teamA}%
                          </span>
                        </div>
                        <div style={styles.probabilityBar}>
                          <div style={{
                            ...styles.probabilityFill, 
                            width: `${isNaN(prediction.winProbability.teamA) ? 0 : Math.min(100, Math.max(0, prediction.winProbability.teamA))}%`
                          }}></div>
                        </div>
                      </div>
                      <div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                          <span style={{fontWeight: '700', fontSize: '1.05rem'}}>{liveData.teamB?.teamName}</span>
                          <span style={{fontWeight: 'bold', fontSize: '1.25rem'}}>
                            {isNaN(prediction.winProbability.teamB) ? '0' : prediction.winProbability.teamB}%
                          </span>
                        </div>
                        <div style={styles.probabilityBar}>
                          <div style={{
                            ...styles.probabilityFill, 
                            width: `${isNaN(prediction.winProbability.teamB) ? 0 : Math.min(100, Math.max(0, prediction.winProbability.teamB))}%`
                          }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Predicted Score */}
                    {prediction.predictedScore > 0 && (
                      <div style={{background: 'rgba(255,255,255,0.25)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.3)'}}>
                        <div style={{color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600'}}>
                          📊 Predicted Final Score
                        </div>
                        <div style={{fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>
                          {Math.round(prediction.predictedScore)}
                        </div>
                      </div>
                    )}

                    {/* Reasoning */}
                    {prediction.reasoning && (
                      <div style={{background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(10px)'}}>
                        <div style={{display: 'flex', alignItems: 'start', gap: '0.75rem'}}>
                          <AlertCircle size={20} style={{marginTop: '0.25rem', flexShrink: 0}} />
                          <div style={{fontSize: '0.95rem', lineHeight: 1.6, fontWeight: '500'}}>
                            {prediction.reasoning}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Key Factors */}
                    <div style={{marginBottom: '1.25rem'}}>
                      <div style={{color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: '700'}}>
                        🎯 Key Factors
                      </div>
                      {prediction.keyFactors.map((factor, idx) => (
                        <div key={idx} style={styles.factorBox}>
                          • {factor}
                        </div>
                      ))}
                    </div>

                    {/* Momentum & Confidence */}
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem'}}>
                      <div style={{background: 'rgba(255,255,255,0.25)', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.3)'}}>
                        <div style={{color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase'}}>
                          Momentum
                        </div>
                        <div style={{fontWeight: 'bold', textTransform: 'capitalize', fontSize: '1.15rem'}}>
                          {prediction.momentum === 'teamA' ? liveData.teamA?.teamName : 
                           prediction.momentum === 'teamB' ? liveData.teamB?.teamName : 
                           'Balanced'}
                        </div>
                      </div>
                      <div style={{background: 'rgba(255,255,255,0.25)', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.3)'}}>
                        <div style={{color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase'}}>
                          Confidence
                        </div>
                        <div style={{fontWeight: 'bold', textTransform: 'capitalize', fontSize: '1.15rem'}}>
                          {prediction.confidence === 'high' ? '🟢 High' : 
                           prediction.confidence === 'medium' ? '🟡 Medium' : 
                           '🔴 Low'}
                        </div>
                      </div>
                    </div>

                    <div style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.25)', fontWeight: '600'}}>
                      🤖 Powered by Rule-Based AI • Auto-updating
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Auto-update Badge */}
          <div style={styles.autoUpdateBadge}>
            <div style={{width: '0.5rem', height: '0.5rem', background: 'white', borderRadius: '50%', boxShadow: '0 0 8px rgba(255,255,255,0.8)'}}></div>
            <span style={{fontSize: '0.9rem', fontWeight: '700'}}>Live Updates Every 30s</span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}