import React, { useState } from 'react';
import { Plus, Play, BarChart3, Calendar, MapPin, Clock, LogOut, User, ArrowLeft, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function ScorerDashboard() {
    const [scorerName] = useState('Rahul Kumar');
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'scoring'
    const [currentMatch, setCurrentMatch] = useState(null);

    // Scoring state
    const [currentScore, setCurrentScore] = useState({ runs: 145, wickets: 5, overs: 18, balls: 3 });
    const [currentBatsman, setCurrentBatsman] = useState({ name: 'Ravi Kumar', runs: 45, balls: 30 });
    const [currentBowler, setCurrentBowler] = useState({ name: 'Shyam Singh', wickets: 3, runs: 28, overs: 4 });
    const [lastBalls, setLastBalls] = useState(['4', '1', '0', 'W', '2', '6']);

    const [assignedMatches] = useState([
        {
            id: 1,
            teamA: 'CSE XI',
            teamB: 'ECE Tigers',
            date: 'Today',
            time: '2:30 PM',
            venue: 'College Ground',
            status: 'live'
        },
        {
            id: 2,
            teamA: 'Mech Warriors',
            teamB: 'IT Strikers',
            date: 'Tomorrow',
            time: '3:00 PM',
            venue: 'Ground 2',
            status: 'upcoming'
        },
        {
            id: 3,
            teamA: 'Civil Champions',
            teamB: 'EEE Thunders',
            date: 'Dec 18',
            time: '4:00 PM',
            venue: 'Main Stadium',
            status: 'upcoming'
        }
    ]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            alert('Logged out successfully!');
        }
    };

    const handleCreateMatch = () => {
        alert('Redirecting to Create Match form...');
    };

    const handleStartScoring = (match = null) => {
        setCurrentMatch(match || assignedMatches[0]);
        setCurrentView('scoring');
    };

    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
        setCurrentMatch(null);
    };

    const handleViewStats = () => {
        alert('Opening statistics dashboard...');
    };

    const handleBallClick = (value) => {
        alert(`Ball recorded: ${value}`);
        // Add logic to update score
        const newBalls = [value, ...lastBalls.slice(0, 5)];
        setLastBalls(newBalls);

        if (value !== 'W' && value !== 'WD' && value !== 'NB') {
            const runs = parseInt(value) || 0;
            setCurrentScore(prev => ({
                ...prev,
                runs: prev.runs + runs,
                balls: prev.balls === 5 ? 0 : prev.balls + 1,
                overs: prev.balls === 5 ? prev.overs + 1 : prev.overs
            }));
            setCurrentBatsman(prev => ({
                ...prev,
                runs: prev.runs + runs,
                balls: prev.balls + 1
            }));
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'live') {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: '9999px',
                    animation: 'pulse 2s infinite'
                }}>
                    🔴 LIVE
                </span>
            );
        }
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 12px',
                background: '#3b82f6',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '9999px'
            }}>
                📅 Upcoming
            </span>
        );
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
            borderRadius: '12px'
        },
        playerLabel: {
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
        },
        playerName: {
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#1f2937'
        },
        playerStats: {
            fontSize: '14px',
            color: '#6b7280',
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
            transition: 'all 0.3s'
        },
        submitBtn: {
            width: '100%',
            background: '#16a34a',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '20px',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s'
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
        }
    };

    // Scoring Interface Component
    const ScoringInterface = () => (
        <div style={styles.mainContent}>
            <div style={styles.actionsCard}>
                {/* Match Info */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        {currentMatch?.teamA} vs {currentMatch?.teamB}
                    </h2>
                    {getStatusBadge('live')}
                </div>

                {/* Current Score */}
                <div style={styles.scoreDisplay}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#6b7280' }}>
                        {currentMatch?.teamA}
                    </div>
                    <div style={styles.scoreLarge}>
                        {currentScore.runs}/{currentScore.wickets}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '16px' }}>
                        {currentScore.overs}.{currentScore.balls} overs • Run Rate: {(currentScore.runs / (currentScore.overs + currentScore.balls / 6)).toFixed(2)}
                    </div>
                </div>

                {/* Current Batsman & Bowler */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={styles.playerBox}>
                        <div style={styles.playerLabel}>🏏 Batsman</div>
                        <div style={styles.playerName}>{currentBatsman.name}</div>
                        <div style={styles.playerStats}>
                            {currentBatsman.runs} runs ({currentBatsman.balls} balls)
                        </div>
                    </div>
                    <div style={styles.playerBox}>
                        <div style={styles.playerLabel}>⚾ Bowler</div>
                        <div style={styles.playerName}>{currentBowler.name}</div>
                        <div style={styles.playerStats}>
                            {currentBowler.wickets}/{currentBowler.runs} ({currentBowler.overs} overs)
                        </div>
                    </div>
                </div>

                {/* Last 6 Balls */}
                <div style={styles.lastBallsContainer}>
                    <div style={styles.lastBallsTitle}>Last 6 Balls:</div>
                    <div style={styles.lastBallsList}>
                        {lastBalls.map((ball, index) => (
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
                        ))}
                    </div>
                </div>

                {/* Ball Buttons */}
                <div style={styles.ballButtonsGrid}>
                    {['0', '1', '2', '3', '4', '6', 'W', 'WD'].map((value) => (
                        <button
                            key={value}
                            style={{
                                ...styles.ballButton,
                                borderColor: value === 'W' ? '#ef4444' : '#7c3aed',
                                color: value === 'W' ? '#ef4444' : '#7c3aed'
                            }}
                            onClick={() => handleBallClick(value)}
                            onMouseEnter={(e) => {
                                e.target.style.background = value === 'W' ? '#ef4444' : '#7c3aed';
                                e.target.style.color = 'white';
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

                {/* Submit Button */}
                <button
                    style={styles.submitBtn}
                    onMouseEnter={(e) => e.target.style.background = '#15803d'}
                    onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                >
                    <CheckCircle size={24} />
                    <span>Submit Ball</span>
                </button>
            </div>
        </div>
    );

    // Dashboard Component
    const Dashboard = () => (
        <div style={styles.mainContent}>
            {/* Welcome Section */}
            <div style={styles.welcomeCard}>
                <h1 style={styles.welcomeTitle}>
                    🎯 Scorer Dashboard
                </h1>
                <p style={styles.welcomeText}>
                    Welcome back, {scorerName}! Ready to score some matches?
                </p>
            </div>

            {/* Quick Actions */}
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

            {/* Assigned Matches */}
            <div style={styles.actionsCard}>
                <h2 style={styles.sectionTitle}>
                    📋 My Assigned Matches
                </h2>

                {assignedMatches.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
                        <p style={{ fontSize: '18px' }}>No matches assigned yet</p>
                    </div>
                ) : (
                    <div>
                        {assignedMatches.map((match) => (
                            <div
                                key={match.id}
                                className="match-card"
                                style={styles.matchCard}
                            >
                                <div style={styles.matchHeader}>
                                    <h3 style={styles.matchTitle}>
                                        {match.teamA} vs {match.teamB}
                                    </h3>
                                    {getStatusBadge(match.status)}
                                </div>

                                <div style={styles.matchDetails}>
                                    <div style={styles.detailItem}>
                                        <Calendar size={18} color="#7c3aed" />
                                        <span>{match.date}, {match.time}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <MapPin size={18} color="#7c3aed" />
                                        <span>{match.venue}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <Clock size={18} color="#7c3aed" />
                                        <span style={{ fontSize: '14px' }}>
                                            {match.status === 'live' ? 'In Progress' : 'Not Started'}
                                        </span>
                                    </div>
                                </div>

                                {match.status === 'live' && (
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
                        ))}
                    </div>
                )}
            </div>

            {/* Statistics Summary */}
            <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                    <div style={styles.statLabel}>Total Matches Scored</div>
                    <div style={styles.statValue}>24</div>
                </div>
                <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <div style={styles.statLabel}>Active Matches</div>
                    <div style={styles.statValue}>
                        {assignedMatches.filter(m => m.status === 'live').length}
                    </div>
                </div>
                <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                    <div style={styles.statLabel}>Upcoming Matches</div>
                    <div style={styles.statValue}>
                        {assignedMatches.filter(m => m.status === 'upcoming').length}
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

              

                {/* Conditional Rendering */}
                {currentView === 'dashboard' ? <Dashboard /> : <ScoringInterface />}
            </div>
            <Footer />
        </>
    );
}