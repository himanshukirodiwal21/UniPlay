// src/pages/ScorerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Play, BarChart3, Calendar, MapPin, Clock, LogOut, User, ArrowLeft, CheckCircle, Trophy } from 'lucide-react';
import { io } from 'socket.io-client';
import Footer from '../components/Footer';
import Header from '../components/Header';

const BACKEND_URL = 'http://localhost:8000';
let socket = null;

export default function ScorerDashboard() {
    const [scorerName] = useState('Rahul Kumar');
    const [currentView, setCurrentView] = useState('dashboard');
    const [currentMatch, setCurrentMatch] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');
    
    // API data states
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Live match data
    const [liveMatchData, setLiveMatchData] = useState(null);
    const [scoringLoading, setScoringLoading] = useState(false);

    // Scoring state
    const [currentBatsman, setCurrentBatsman] = useState('');
    const [currentBowler, setCurrentBowler] = useState('');
    const [lastBalls, setLastBalls] = useState([]);

    // Fetch matches when tab changes
    useEffect(() => {
        if (currentView === 'dashboard') {
            fetchMatches();
        }
    }, [activeTab, currentView]);

    // Socket.IO connection
    useEffect(() => {
        if (currentMatch && currentView === 'scoring') {
            // Connect to Socket.IO
            socket = io(BACKEND_URL);

            socket.on('connect', () => {
                console.log('✅ Socket connected:', socket.id);
                socket.emit('join-match', currentMatch._id);
            });

            socket.on('ball-updated', (data) => {
                console.log('🏏 Ball update received:', data);
                // Update live match data
                fetchLiveMatchData();
            });

            socket.on('innings-complete', (data) => {
                console.log('✅ Innings complete:', data);
                alert('Innings completed! Starting next innings...');
                fetchLiveMatchData();
                // Clear batsman/bowler fields for new innings
                setCurrentBatsman('');
                setCurrentBowler('');
                setLastBalls([]);
            });

            socket.on('match-complete', (data) => {
                console.log('🏆 Match complete:', data);
                alert('Match completed! Redirecting to dashboard...');
                setTimeout(() => {
                    handleBackToDashboard();
                }, 2000);
            });

            return () => {
                if (socket) {
                    socket.disconnect();
                    console.log('❌ Socket disconnected');
                }
            };
        }
    }, [currentMatch, currentView]);

    // Fetch live match data
    useEffect(() => {
        if (currentMatch && currentView === 'scoring') {
            fetchLiveMatchData();
        }
    }, [currentMatch, currentView]);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            setError(null);

            const statusMap = {
                'live': 'InProgress',
                'upcoming': 'Scheduled',
                'completed': 'Completed'
            };

            const status = statusMap[activeTab];
            const url = `${BACKEND_URL}/api/v1/matches?status=${status}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setMatches(data.data || []);
            
        } catch (err) {
            console.error('❌ Fetch Error:', err);
            setError(err.message.includes('Failed to fetch') 
                ? 'Cannot connect to server. Is backend running?' 
                : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchLiveMatchData = async () => {
        if (!currentMatch) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/live-matches/${currentMatch._id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 Live Match Data:', data.data);
            setLiveMatchData(data.data);
            
            // Update last balls
            const currentInnings = data.data.innings[data.data.currentInnings - 1];
            if (currentInnings && currentInnings.ballByBall) {
                const recent = currentInnings.ballByBall.slice(-6).reverse();
                setLastBalls(recent.map(b => b.runs === 0 && b.isWicket ? 'W' : b.runs.toString()));
            }

        } catch (err) {
            console.error('❌ Error fetching live match:', err);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            alert('Logged out successfully!');
        }
    };

    const handleCreateMatch = () => {
        alert('Redirecting to Create Match form...');
    };

    const handleStartScoring = async (match = null) => {
        const matchToScore = match || matches[0];
        
        // Check if match is already initialized
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/live-matches/${matchToScore._id}`);
            const data = await response.json();
            
            if (!data.success) {
                // Match not initialized, initialize it
                const shouldInitialize = window.confirm(
                    'This match needs to be initialized first.\n\nDo you want to initialize it now?'
                );
                
                if (shouldInitialize) {
                    await initializeMatch(matchToScore);
                } else {
                    return;
                }
            }
        } catch (err) {
            console.error('Error checking match status:', err);
        }
        
        setCurrentMatch(matchToScore);
        setCurrentView('scoring');
    };

    const initializeMatch = async (match) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/live-matches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    matchId: match._id,
                    tossWinner: match.teamA._id, // Default to teamA, can be made dynamic
                    choice: 'bat' // Default choice, can be made dynamic
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to initialize match');
            }

            const result = await response.json();
            console.log('✅ Match initialized:', result);
            alert('Match initialized successfully!');
        } catch (err) {
            console.error('❌ Error initializing match:', err);
            alert(`Error initializing match: ${err.message}`);
            throw err;
        }
    };

    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
        setCurrentMatch(null);
        setLiveMatchData(null);
        setCurrentBatsman('');
        setCurrentBowler('');
        setLastBalls([]);
    };

    const handleViewStats = () => {
        alert('Opening statistics dashboard...');
    };

    const handleBallClick = async (value) => {
        if (!currentBatsman || !currentBowler) {
            alert('Please enter batsman and bowler names first!');
            return;
        }

        // ✅ CHECK: Prevent scoring if innings is complete
        const currentInnings = liveMatchData.innings[liveMatchData.currentInnings - 1];
        if (currentInnings.wickets >= 10) {
            alert('This innings is complete (10 wickets)!\n\nClick "End Innings" to proceed.');
            return;
        }

        setScoringLoading(true);

        try {
            let ballData = {
                batsman: currentBatsman,
                bowler: currentBowler,
                runs: 0,
                extras: 0,
                extrasType: 'none',
                isWicket: false,
                wicketType: 'none',
                commentary: ''
            };

            // Parse button value
            if (value === 'W') {
                ballData.isWicket = true;
                ballData.wicketType = 'caught';
                ballData.commentary = `WICKET! ${currentBatsman} is out!`;
            } else if (value === 'WD') {
                ballData.extras = 1;
                ballData.extrasType = 'wide';
                ballData.commentary = 'Wide ball';
            } else if (value === 'NB') {
                ballData.extras = 1;
                ballData.extrasType = 'noBall';
                ballData.commentary = 'No ball';
            } else {
                ballData.runs = parseInt(value);
                ballData.commentary = value === '4' ? 'FOUR!' : value === '6' ? 'SIX!' : `${value} run${value === '1' ? '' : 's'}`;
            }

            console.log('📤 Sending ball data:', ballData);

            const response = await fetch(`${BACKEND_URL}/api/v1/live-matches/${currentMatch._id}/ball`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ballData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update ball');
            }

            const result = await response.json();
            console.log('✅ Ball updated:', result);

            // Refresh live data
            await fetchLiveMatchData();

            // Update last balls display
            setLastBalls([value, ...lastBalls.slice(0, 5)]);

            // ✅ CHECK: If wicket was just taken and now at 10 wickets
            if (ballData.isWicket) {
                const updatedInnings = liveMatchData.innings[liveMatchData.currentInnings - 1];
                if ((updatedInnings.wickets + 1) >= 10) {
                    setTimeout(() => {
                        alert('10 wickets down! Click "End Innings" to proceed to next innings.');
                    }, 500);
                }
            }

        } catch (err) {
            console.error('❌ Error updating ball:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setScoringLoading(false);
        }
    };

    const handleEndInnings = async () => {
        const currentInnings = liveMatchData.innings[liveMatchData.currentInnings - 1];
        
        if (currentInnings.wickets < 10) {
            const confirmEnd = window.confirm(
                `Are you sure you want to end this innings?\n\nCurrent: ${currentInnings.score}/${currentInnings.wickets} in ${currentInnings.overs} overs\n\nNote: Less than 10 wickets have fallen.`
            );
            if (!confirmEnd) return;
        }

        try {
            setScoringLoading(true);
            
            const response = await fetch(`${BACKEND_URL}/api/v1/live-matches/${currentMatch._id}/complete-innings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to end innings');
            }

            const result = await response.json();
            console.log('✅ Innings ended:', result);

            // Clear fields for new innings
            setCurrentBatsman('');
            setCurrentBowler('');
            setLastBalls([]);

            alert('Innings ended! Starting next innings...');
            await fetchLiveMatchData();

        } catch (err) {
            console.error('❌ Error ending innings:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setScoringLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'InProgress': {
                bg: '#ef4444',
                text: '🔴 LIVE',
                animate: true
            },
            'Scheduled': {
                bg: '#3b82f6',
                text: '📅 Upcoming',
                animate: false
            },
            'Completed': {
                bg: '#10b981',
                text: '✅ Completed',
                animate: false
            }
        };

        const badge = badges[status] || badges['Scheduled'];

        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 12px',
                background: badge.bg,
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '9999px',
                animation: badge.animate ? 'pulse 2s infinite' : 'none'
            }}>
                {badge.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgb(75, 85, 99) 0%, rgb(107, 114, 128) 50%, rgb(156, 163, 175) 100%)',
        },
        header: {
            background: '#111827',
            color: 'white',
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
        },
        headerContent: {
            maxWidth: '1152px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        userLabel: {
            fontSize: '14px',
            color: '#9ca3af'
        },
        userName: {
            fontWeight: 'bold',
            fontSize: '18px'
        },
        backBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#6366f1',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        logoutBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#dc2626',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        mainContent: {
            maxWidth: '1152px',
            margin: '0 auto',
            padding: '32px 24px'
        },
        welcomeCard: {
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            padding: '32px',
            marginBottom: '32px'
        },
        welcomeTitle: {
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
        },
        welcomeText: {
            color: '#4b5563',
            fontSize: '18px'
        },
        actionsCard: {
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            padding: '32px',
            marginBottom: '32px'
        },
        sectionTitle: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        buttonGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
        },
        actionBtn: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px 24px',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
            transition: 'all 0.3s'
        },
        tabsWrapper: {
            display: 'flex',
            gap: '16px',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '12px',
            marginBottom: '24px'
        },
        tab: {
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#6b7280',
            borderBottom: '3px solid transparent',
            transition: 'all 0.3s',
            position: 'relative',
            top: '2px'
        },
        activeTab: {
            color: '#7c3aed',
            borderBottomColor: '#7c3aed'
        },
        matchCard: {
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        matchHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '12px'
        },
        matchTitle: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937'
        },
        matchDetails: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            color: '#4b5563'
        },
        detailItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        continueBtn: {
            width: '100%',
            background: '#16a34a',
            color: 'white',
            fontWeight: 'bold',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s',
            marginTop: '16px'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginTop: '32px'
        },
        statCard: {
            borderRadius: '12px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
        },
        statLabel: {
            opacity: 0.9,
            marginBottom: '8px',
            fontSize: '14px'
        },
        statValue: {
            fontSize: '36px',
            fontWeight: 'bold'
        },
        scoreDisplay: {
            background: '#f8f9fa',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '20px',
            borderLeft: '6px solid #7c3aed'
        },
        scoreLarge: {
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
        },
        playerBox: {
            flex: 1,
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px'
        },
        playerLabel: {
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
        },
        playerInput: {
            width: '100%',
            padding: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: '2px solid #e5e7eb',
            borderRadius: '6px',
            marginTop: '4px'
        },
        ballButtonsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '20px'
        },
        ballButton: {
            background: 'white',
            border: '3px solid #7c3aed',
            color: '#7c3aed',
            padding: '20px',
            borderRadius: '12px',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            opacity: scoringLoading ? 0.5 : 1
        },
        endInningsBtn: {
            width: '100%',
            background: '#dc2626',
            color: 'white',
            fontWeight: 'bold',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s',
            marginTop: '20px',
            fontSize: '16px'
        },
        lastBallsContainer: {
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px'
        },
        lastBallsTitle: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#6b7280',
            marginBottom: '12px'
        },
        lastBallsList: {
            display: 'flex',
            gap: '8px'
        },
        lastBall: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
        },
        scoreBox: {
            background: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '16px'
        },
        score: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937'
        },
        emptyState: {
            textAlign: 'center',
            padding: '64px 24px',
            color: '#6b7280'
        },
        emptyIcon: {
            fontSize: '48px',
            marginBottom: '16px'
        },
        emptyText: {
            fontSize: '18px',
            fontWeight: '600'
        },
        loadingSpinner: {
            textAlign: 'center',
            padding: '48px',
            color: '#6b7280'
        },
        errorBox: {
            background: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            padding: '16px',
            color: '#dc2626',
            textAlign: 'center'
        },
        warningBox: {
            background: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#92400e'
        }
    };

    // Scoring Interface Component
    const ScoringInterface = () => {
        if (!liveMatchData) {
            return (
                <div style={styles.mainContent}>
                    <div style={styles.loadingSpinner}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                        <div>Loading live match data...</div>
                    </div>
                </div>
            );
        }

        const currentInnings = liveMatchData.innings[liveMatchData.currentInnings - 1];
        const isInningsComplete = currentInnings.wickets >= 10;

        return (
            <div style={styles.mainContent}>
                <div style={styles.actionsCard}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                            {liveMatchData.teamA?.teamName || 'Team A'} vs {liveMatchData.teamB?.teamName || 'Team B'}
                        </h2>
                        {getStatusBadge('InProgress')}
                    </div>

                    {/* ✅ WARNING: Innings Complete */}
                    {isInningsComplete && (
                        <div style={styles.warningBox}>
                            <CheckCircle size={24} color="#f59e0b" />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                    Innings Complete - 10 Wickets Down!
                                </div>
                                <div style={{ fontSize: '14px' }}>
                                    Click "End Innings" button below to proceed to the next innings.
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={styles.scoreDisplay}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#6b7280' }}>
                            {currentInnings.battingTeam?.teamName || 'Batting Team'} - Innings {liveMatchData.currentInnings}
                        </div>
                        <div style={styles.scoreLarge}>
                            {currentInnings.score}/{currentInnings.wickets}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '16px' }}>
                            {currentInnings.overs} overs • Run Rate: {(currentInnings.score / (currentInnings.overs || 1)).toFixed(2)}
                        </div>
                        {/* ✅ Wickets indicator */}
                        <div style={{ 
                            marginTop: '12px', 
                            padding: '8px', 
                            background: isInningsComplete ? '#fee2e2' : '#e0e7ff',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: isInningsComplete ? '#dc2626' : '#4f46e5'
                        }}>
                            {isInningsComplete 
                                ? '⚠️ All Out - 10 Wickets Down' 
                                : `Wickets Remaining: ${10 - currentInnings.wickets}/10`
                            }
                        </div>
                    </div>

                    {/* Player Input Fields */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={styles.playerBox}>
                            <div style={styles.playerLabel}>🏏 Current Batsman</div>
                            <input
                                type="text"
                                style={styles.playerInput}
                                placeholder="Enter batsman name"
                                value={currentBatsman}
                                onChange={(e) => setCurrentBatsman(e.target.value)}
                                disabled={isInningsComplete}
                            />
                        </div>
                        <div style={styles.playerBox}>
                            <div style={styles.playerLabel}>⚾ Current Bowler</div>
                            <input
                                type="text"
                                style={styles.playerInput}
                                placeholder="Enter bowler name"
                                value={currentBowler}
                                onChange={(e) => setCurrentBowler(e.target.value)}
                                disabled={isInningsComplete}
                            />
                        </div>
                    </div>

                    <div style={styles.lastBallsContainer}>
                        <div style={styles.lastBallsTitle}>Last 6 Balls:</div>
                        <div style={styles.lastBallsList}>
                            {lastBalls.length === 0 ? (
                                <div style={{ color: '#6b7280' }}>No balls yet</div>
                            ) : (
                                lastBalls.map((ball, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            ...styles.lastBall,
                                            background: ball === 'W' ? '#ef4444' :
                                                ball === '6' ? '#7c3aed' :
                                                    ball === '4' ? '#3b82f6' : '#e5e7eb',
                                            color: ['W', '6', '4'].includes(ball) ? 'white' : '#1f2937'
                                        }}
                                    >
                                        {ball}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ✅ Ball Buttons - Disabled if innings complete */}
                    <div style={styles.ballButtonsGrid}>
                        {['0', '1', '2', '3', '4', '6', 'W', 'WD'].map((value) => (
                            <button
                                key={value}
                                style={{
                                    ...styles.ballButton,
                                    borderColor: value === 'W' ? '#ef4444' : '#7c3aed',
                                    color: value === 'W' ? '#ef4444' : '#7c3aed',
                                    opacity: (scoringLoading || isInningsComplete) ? 0.5 : 1,
                                    cursor: (scoringLoading || isInningsComplete) ? 'not-allowed' : 'pointer'
                                }}
                                onClick={() => handleBallClick(value)}
                                disabled={scoringLoading || isInningsComplete}
                                onMouseEnter={(e) => {
                                    if (!scoringLoading && !isInningsComplete) {
                                        e.target.style.background = value === 'W' ? '#ef4444' : '#7c3aed';
                                        e.target.style.color = 'white';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'white';
                                    e.target.style.color = value === 'W' ? '#ef4444' : '#7c3aed';
                                }}
                            >
                                {value}
                            </button>
                        ))}
                    </div>

                    {scoringLoading && (
                        <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '16px' }}>
                            ⏳ Updating score...
                        </div>
                    )}

                    {/* ✅ END INNINGS BUTTON */}
                    <button
                        style={styles.endInningsBtn}
                        onClick={handleEndInnings}
                        disabled={scoringLoading}
                        onMouseEnter={(e) => {
                            if (!scoringLoading) e.target.style.background = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#dc2626';
                        }}
                    >
                        <CheckCircle size={20} />
                        <span>End Innings {liveMatchData.currentInnings}</span>
                    </button>
                </div>
            </div>
        );
    };

    // Render Matches based on status
    const renderMatches = () => {
        if (loading) {
            return (
                <div style={styles.loadingSpinner}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                    <div>Loading matches...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div style={styles.errorBox}>
                    <strong>Error:</strong> {error}
                </div>
            );
        }

        if (matches.length === 0) {
            const emptyMessages = {
                live: { icon: '🏏', text: 'No live matches at the moment' },
                upcoming: { icon: '📅', text: 'No upcoming matches scheduled' },
                completed: { icon: '🏆', text: 'No completed matches yet' }
            };

            const message = emptyMessages[activeTab];

            return (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>{message.icon}</div>
                    <p style={styles.emptyText}>{message.text}</p>
                </div>
            );
        }

        return matches.map((match) => (
            <div
                key={match._id}
                style={styles.matchCard}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(124, 58, 237, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <div style={styles.matchHeader}>
                    <h3 style={styles.matchTitle}>
                        {match.teamA?.teamName || 'Team A'} vs {match.teamB?.teamName || 'Team B'}
                    </h3>
                    {getStatusBadge(match.status)}
                </div>

                <div style={styles.matchDetails}>
                    <div style={styles.detailItem}>
                        <Calendar size={18} color="#7c3aed" />
                        <span>{formatDate(match.scheduledTime)}, {formatTime(match.scheduledTime)}</span>
                    </div>
                    <div style={styles.detailItem}>
                        <MapPin size={18} color="#7c3aed" />
                        <span>{match.venue}</span>
                    </div>
                    <div style={styles.detailItem}>
                        <Clock size={18} color="#7c3aed" />
                        <span>{match.stage} - Round {match.round}</span>
                    </div>
                </div>

                {(match.status === 'InProgress' || match.status === 'Completed') && (
                    <div style={styles.scoreBox}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                                    {match.teamA?.teamName}
                                </div>
                                <div style={styles.score}>{match.scoreA || 0}/{match.wicketsA || 0}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                    ({match.oversA || 0} ov)
                                </div>
                            </div>
                            <div style={{ fontSize: '24px', color: '#9ca3af' }}>vs</div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                                    {match.teamB?.teamName}
                                </div>
                                <div style={styles.score}>{match.scoreB || 0}/{match.wicketsB || 0}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                    ({match.oversB || 0} ov)
                                </div>
                            </div>
                        </div>
                        {match.winner && (
                            <div style={{
                                marginTop: '12px',
                                padding: '8px',
                                background: '#dcfce7',
                                borderRadius: '6px',
                                textAlign: 'center',
                                color: '#166534',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <Trophy size={16} />
                                Winner: {match.winner?.teamName || 'TBD'}
                            </div>
                        )}
                    </div>
                )}

                {match.status === 'InProgress' && (
                    <button
                        style={styles.continueBtn}
                        onClick={() => handleStartScoring(match)}
                        onMouseEnter={(e) => e.target.style.background = '#15803d'}
                        onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                    >
                        <Play size={20} />
                        Continue Scoring
                    </button>
                )}
            </div>
        ));
    };

    // Dashboard Component
    const Dashboard = () => (
        <div style={styles.mainContent}>
            <div style={styles.welcomeCard}>
                <h1 style={styles.welcomeTitle}>
                    🎯 Scorer Dashboard</h1>
                <p style={styles.welcomeText}>
                    Welcome back, {scorerName}! Ready to score some matches?
                </p>
            </div>

            <div style={styles.actionsCard}>
                <h2 style={styles.sectionTitle}>
                    ⚡ Quick Actions
                </h2>
                <div style={styles.buttonGrid}>
                    <button
                        style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                        onClick={handleCreateMatch}
                        onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #6d28d9, #5b21b6)'}
                        onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #7c3aed, #6d28d9)'}
                    >
                        <Plus size={24} />
                        <span>Create New Match</span>
                    </button>

                    <button
                        style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                        onClick={() => handleStartScoring()}
                        onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #15803d, #166534)'}
                        onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #16a34a, #15803d)'}
                    >
                        <Play size={24} />
                        <span>Start Scoring</span>
                    </button>

                    <button
                        style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                        onClick={handleViewStats}
                        onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #1d4ed8, #1e40af)'}
                        onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)'}
                    >
                        <BarChart3 size={24} />
                        <span>View Statistics</span>
                    </button>
                </div>
            </div>

            <div style={styles.actionsCard}>
                <h2 style={styles.sectionTitle}>
                    📋 My Assigned Matches
                </h2>

                <div style={styles.tabsWrapper}>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'live' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('live')}
                    >
                        🔴 Live
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'upcoming' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        📅 Upcoming
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'completed' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('completed')}
                    >
                        ✅ Completed
                    </button>
                </div>

                {renderMatches()}
            </div>

            <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                    <div style={styles.statLabel}>Total Matches Scored</div>
                    <div style={styles.statValue}>24</div>
                </div>
                <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <div style={styles.statLabel}>Active Matches</div>
                    <div style={styles.statValue}>
                        {matches.filter(m => m.status === 'InProgress').length}
                    </div>
                </div>
                <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                    <div style={styles.statLabel}>Upcoming Matches</div>
                    <div style={styles.statValue}>
                        {matches.filter(m => m.status === 'Scheduled').length}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Header />
            <div style={styles.container}>
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.7; }
                    }
                    button:hover {
                        transform: translateY(-2px);
                    }
                    .match-card:hover {
                        border-color: #7c3aed !important;
                        box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3) !important;
                    }
                `}</style>

                {/* Custom Header for Scoring View */}
                {currentView === 'scoring' && (
                    <div style={styles.header}>
                        <div style={styles.headerContent}>
                            <button
                                style={styles.backBtn}
                                onClick={handleBackToDashboard}
                                onMouseEnter={(e) => e.target.style.background = '#4f46e5'}
                                onMouseLeave={(e) => e.target.style.background = '#6366f1'}
                            >
                                <ArrowLeft size={20} />
                                <span>Back to Dashboard</span>
                            </button>

                            <div style={styles.userInfo}>
                                <User size={20} />
                                <div>
                                    <div style={styles.userLabel}>Scorer</div>
                                    <div style={styles.userName}>{scorerName}</div>
                                </div>
                            </div>

                            <button
                                style={styles.logoutBtn}
                                onClick={handleLogout}
                                onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                                onMouseLeave={(e) => e.target.style.background = '#dc2626'}
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Conditional Rendering */}
                {currentView === 'dashboard' ? <Dashboard /> : <ScoringInterface />}
            </div>
            <Footer />
        </>
    );
}