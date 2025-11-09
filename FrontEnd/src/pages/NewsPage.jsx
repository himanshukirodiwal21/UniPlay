// src/pages/NewsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Trophy, Calendar, TrendingUp, Zap, Award } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

export default function NewsPage() {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, events, matches, teams

  useEffect(() => {
    fetchAndGenerateNews();
    
    // Refresh news every 30 seconds
    const interval = setInterval(fetchAndGenerateNews, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAndGenerateNews = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching news data...');
      
      // ✅ FIXED: Match actual backend routes from app.js
      const [eventsRes, matchesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/v1/events`),        // ✅ From requestEventRouter
        fetch(`${BACKEND_URL}/api/v1/matches`)        // ✅ From matchRoutes
      ]);

      console.log('📡 Events Response Status:', eventsRes.status);
      console.log('📡 Matches Response Status:', matchesRes.status);

      const eventsData = await eventsRes.json();
      const matchesData = await matchesRes.json();

      console.log('📊 Events Data:', eventsData);
      console.log('📊 Matches Data:', matchesData);

      const events = eventsData.data || [];
      const matches = matchesData.data || [];

      console.log(`✅ Found ${events.length} events`);
      console.log(`✅ Found ${matches.length} matches`);

      // Generate news items
      const generatedNews = [];

      // 1. Event News - Recent events (within 30 days)
      console.log('🎯 Processing events for news...');
      events.forEach(event => {
        const eventDate = new Date(event.date || event.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now - eventDate) / (1000 * 60 * 60 * 24));

        console.log('📅 Event:', event.name, '| Days diff:', daysDiff, '| Date:', eventDate.toLocaleDateString(), '| Event ID:', event._id);

        // Show ALL events regardless of date for testing
        generatedNews.push({
          id: `event-${event._id}`,
          type: 'event',
          category: daysDiff < 0 ? 'Upcoming Event' : daysDiff === 0 ? 'Event Today' : 'Event Update',
          title: daysDiff < 0 
            ? `📅 ${event.name} Starting Soon!` 
            : daysDiff === 0 
            ? `🎉 ${event.name} Starts Today!`
            : `🏏 ${event.name} Tournament`,
          description: `${daysDiff < 0 ? 'Get ready for' : 'The exciting'} ${event.name} tournament${event.location ? ` at ${event.location}` : ''}. ${daysDiff < 0 ? `Starts in ${Math.abs(daysDiff)} days!` : daysDiff === 0 ? 'The action begins today!' : 'Teams are competing for glory!'}`,
          timestamp: eventDate,
          icon: 'Calendar',
          color: '#3b82f6',
          priority: daysDiff < 0 ? 5 : daysDiff === 0 ? 1 : 6,
          eventId: event._id
        });
      });

      console.log(`✅ Generated ${generatedNews.filter(n => n.type === 'event').length} event news items`);

      // 2. Live Matches - Highest priority
      const liveMatches = matches.filter(m => m.status === 'InProgress');
      for (const match of liveMatches) {
        try {
          // ✅ Fetch live data from correct route
          const liveRes = await fetch(`${BACKEND_URL}/api/v1/live-matches/${match._id}`);
          const liveData = await liveRes.json();
          
          let currentScore = '';
          if (liveData.success && liveData.data.innings) {
            const currentInnings = liveData.data.innings[liveData.data.currentInnings - 1];
            if (currentInnings) {
              currentScore = ` (${currentInnings.score}/${currentInnings.wickets} in ${currentInnings.overs} overs)`;
            }
          }

          generatedNews.push({
            id: `live-${match._id}`,
            type: 'match',
            category: 'Live Match',
            title: `🔴 LIVE: ${match.teamA?.teamName} vs ${match.teamB?.teamName}`,
            description: `Catch the action live as ${match.teamA?.teamName} takes on ${match.teamB?.teamName}${match.venue ? ` at ${match.venue}` : ''}${currentScore}. The battle is heating up!`,
            timestamp: new Date(match.date || match.createdAt),
            icon: 'Zap',
            color: '#ef4444',
            priority: 0,
            matchId: match._id
          });
        } catch (err) {
          console.error('Error fetching live match:', err);
        }
      }

      // 3. Match Results - Completed matches (within last week)
      const completedMatches = matches.filter(m => m.status === 'Completed');
      
      for (const match of completedMatches.slice(0, 10)) {
        try {
          // ✅ Fetch live data for accurate final scores
          const liveRes = await fetch(`${BACKEND_URL}/api/v1/live-matches/${match._id}`);
          const liveData = await liveRes.json();
          
          let scoreA = 0, scoreB = 0, wicketsA = 0, wicketsB = 0;
          
          if (liveData.success && liveData.data.innings) {
            const innings = liveData.data.innings;
            
            innings.forEach(inning => {
              if (inning.battingTeam?._id?.toString() === match.teamA?._id?.toString()) {
                scoreA += inning.score || 0;
                wicketsA = Math.max(wicketsA, inning.wickets || 0);
              }
              if (inning.battingTeam?._id?.toString() === match.teamB?._id?.toString()) {
                scoreB += inning.score || 0;
                wicketsB = Math.max(wicketsB, inning.wickets || 0);
              }
            });
          }

          const winnerName = match.winner?.teamName || 'TBD';
          const loserName = match.winner?._id === match.teamA?._id 
            ? match.teamB?.teamName 
            : match.teamA?.teamName;

          const matchDate = new Date(match.date || match.createdAt);
          const hoursDiff = Math.floor((new Date() - matchDate) / (1000 * 60 * 60));

          console.log('🏏 Completed Match:', match.teamA?.teamName, 'vs', match.teamB?.teamName, 'Hours ago:', hoursDiff, 'Match ID:', match._id);

          if (hoursDiff <= 168) { // Within last week
            generatedNews.push({
              id: `match-${match._id}`,
              type: 'match',
              category: 'Match Result',
              title: `🏆 ${winnerName} Defeats ${loserName}`,
              description: `${match.teamA?.teamName} ${scoreA}/${wicketsA} vs ${match.teamB?.teamName} ${scoreB}/${wicketsB}. ${winnerName} emerged victorious in ${match.stage || 'a thrilling'} encounter${match.venue ? ` at ${match.venue}` : ''}.`,
              timestamp: matchDate,
              icon: 'Trophy',
              color: '#10b981',
              priority: 2,
              matchId: match._id
            });
          }
        } catch (err) {
          console.error('Error processing match:', err);
        }
      }

      // 4. Team Achievements - Calculate from completed matches
      console.log('🎯 Processing team achievements...');
      const eventIds = [...new Set(matches.map(m => m.event?._id).filter(Boolean))];
      
      console.log('📊 Unique event IDs from matches:', eventIds);
      
      for (const eventId of eventIds.slice(0, 3)) {
        const eventMatches = matches.filter(m => 
          m.event?._id === eventId && m.status === 'Completed'
        );

        console.log(`🏆 Event ${eventId}: ${eventMatches.length} completed matches`);

        // Calculate team stats
        const teamStats = {};
        
        eventMatches.forEach(match => {
          const teamA = match.teamA;
          const teamB = match.teamB;
          
          if (!teamA || !teamB) return;

          if (!teamStats[teamA._id]) {
            teamStats[teamA._id] = { team: teamA, wins: 0, matches: 0 };
          }
          if (!teamStats[teamB._id]) {
            teamStats[teamB._id] = { team: teamB, wins: 0, matches: 0 };
          }

          teamStats[teamA._id].matches++;
          teamStats[teamB._id].matches++;

          if (match.winner?._id === teamA._id) {
            teamStats[teamA._id].wins++;
          } else if (match.winner?._id === teamB._id) {
            teamStats[teamB._id].wins++;
          }
        });

        console.log('📊 Team stats:', teamStats);

        // Find ALL performing teams (not just top 1)
        const topTeams = Object.values(teamStats)
          .filter(t => t.matches >= 2) // Reduced from 3 to 2 matches
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 3); // Top 3 teams

        console.log('⭐ Top teams:', topTeams);

        topTeams.forEach((teamStat, idx) => {
          if (teamStat.wins >= 1) { // Reduced from 3 to 1 win minimum
            const event = events.find(e => e._id === eventId);
            const position = idx === 0 ? 'Leading' : idx === 1 ? 'Strong Contender' : 'Rising Star';
            
            console.log(`✅ Adding team news for: ${teamStat.team.teamName}`);
            
            generatedNews.push({
              id: `achievement-${eventId}-${teamStat.team._id}`,
              type: 'team',
              category: 'Team Achievement',
              title: `⭐ ${teamStat.team.teamName} - ${position} in ${event?.name || 'Tournament'}`,
              description: `${teamStat.team.teamName} shows impressive form with ${teamStat.wins} wins from ${teamStat.matches} matches. ${idx === 0 ? "They're currently leading the tournament!" : "They're a strong contender for the title!"}`,
              timestamp: new Date(),
              icon: 'TrendingUp',
              color: '#8b5cf6',
              priority: 3 + idx,
              teamId: teamStat.team._id
            });
          }
        });
      }

      console.log(`✅ Generated ${generatedNews.filter(n => n.type === 'team').length} team news items`);

      // 5. Upcoming Matches Preview (within next 48 hours)
      const upcomingMatches = matches.filter(m => m.status === 'Scheduled').slice(0, 5);
      upcomingMatches.forEach(match => {
        const matchDate = new Date(match.date);
        const hoursUntil = Math.floor((matchDate - new Date()) / (1000 * 60 * 60));
        
        if (hoursUntil >= 0 && hoursUntil <= 48) {
          generatedNews.push({
            id: `upcoming-${match._id}`,
            type: 'match',
            category: 'Upcoming Match',
            title: `📅 ${match.teamA?.teamName} vs ${match.teamB?.teamName} - ${hoursUntil}h Away`,
            description: `Don't miss the upcoming clash between ${match.teamA?.teamName} and ${match.teamB?.teamName}${match.venue ? ` at ${match.venue}` : ''}. ${match.stage || 'League'} stage match starts soon!`,
            timestamp: matchDate,
            icon: 'Calendar',
            color: '#f59e0b',
            priority: 4,
            matchId: match._id
          });
        }
      });

      // Sort by priority (lower = higher priority) and then by timestamp
      generatedNews.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return b.timestamp - a.timestamp;
      });

      console.log('📰 Total news generated:', generatedNews.length);
      console.log('📰 News breakdown:', {
        events: generatedNews.filter(n => n.type === 'event').length,
        matches: generatedNews.filter(n => n.type === 'match').length,
        teams: generatedNews.filter(n => n.type === 'team').length
      });

      setNewsItems(generatedNews);
    } catch (err) {
      console.error('❌ Error generating news:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = newsItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'events') return item.type === 'event';
    if (filter === 'matches') return item.type === 'match';
    if (filter === 'teams') return item.type === 'team';
    return true;
  });

  const handleNewsClick = (item) => {
    console.log('🖱️ Clicked news item:', item);
    
    // Navigate based on news type and available IDs
    if (item.type === 'match' && item.matchId) {
      // For live matches, go to live view; for completed/upcoming go to match result
      if (item.category === 'Live Match') {
        console.log('➡️ Navigating to live match:', `/live-match/${item.matchId}`);
        navigate(`/live-match/${item.matchId}`);
      } else {
        console.log('➡️ Navigating to match result:', `/match-result/${item.matchId}`);
        navigate(`/match-result/${item.matchId}`);
      }
    } else if (item.type === 'team' && item.teamId) {
      console.log('➡️ Navigating to team:', `/team/${item.teamId}`);
      navigate(`/team/${item.teamId}`);
    } else if (item.type === 'event' && item.eventId) {
      console.log('➡️ Navigating to event:', `/event/${item.eventId}`);
      navigate(`/event/${item.eventId}`);
    } else {
      console.log('⚠️ No valid navigation target for this news item');
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (iconName) => {
    const icons = {
      Trophy,
      Calendar,
      TrendingUp,
      Zap,
      Award
    };
    return icons[iconName] || Award;
  };

  return (
    <>
      <Header />
      <div style={styles.wrapper}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <div>
                <h1 style={styles.title}>📰 Cricket News</h1>
                <p style={styles.subtitle}>Stay updated with the latest cricket action</p>
              </div>
              <div style={styles.liveIndicator}>
                <div style={styles.liveDot} />
                Live Updates
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={styles.filterContainer}>
            {['all', 'events', 'matches', 'teams'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterButton,
                  ...(filter === f ? styles.filterButtonActive : {})
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* News Feed */}
          <div style={styles.newsFeed}>
            {loading ? (
              <div style={styles.loading}>
                <div style={styles.spinner} />
                <p>Loading latest news...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div style={styles.empty}>
                <Award size={64} color="#9ca3af" />
                <h3>No news available</h3>
                <p>Check back soon for updates!</p>
              </div>
            ) : (
              filteredNews.map(item => {
                const Icon = getIcon(item.icon);
                return (
                  <div
                    key={item.id}
                    style={styles.newsCard}
                    onClick={() => handleNewsClick(item)}
                  >
                    <div style={{
                      ...styles.iconContainer,
                      background: `${item.color}15`
                    }}>
                      <Icon size={24} color={item.color} />
                    </div>
                    
                    <div style={styles.newsContent}>
                      <div style={styles.newsHeader}>
                        <span style={{
                          ...styles.category,
                          color: item.color,
                          borderColor: item.color
                        }}>
                          {item.category}
                        </span>
                        <span style={styles.timestamp}>
                          {getTimeAgo(item.timestamp)}
                        </span>
                      </div>
                      
                      <h3 style={styles.newsTitle}>{item.title}</h3>
                      <p style={styles.newsDescription}>{item.description}</p>
                      
                      {(item.matchId || item.teamId) && (
                        <div style={styles.readMore}>
                          View Details →
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Auto-refresh indicator */}
          {!loading && (
            <div style={styles.refreshIndicator}>
              <div style={styles.refreshDot} />
              Auto-updating every 30s
            </div>
          )}

          <style>
            {`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              @keyframes livePulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
              }
            `}
          </style>
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    paddingBottom: '40px',
  },
  container: {
    minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    color: 'white',
    padding: '40px 20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: 0.9,
    margin: 0,
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(239, 68, 68, 0.2)',
    padding: '10px 20px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },
  liveDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#ef4444',
    animation: 'livePulse 2s infinite',
  },
  filterContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: '10px 24px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#6b7280',
  },
  filterButtonActive: {
    background: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  },
  newsFeed: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  newsCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid transparent',
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  newsContent: {
    flex: 1,
  },
  newsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  category: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '4px 12px',
    borderRadius: '12px',
    border: '2px solid',
  },
  timestamp: {
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  newsTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  },
  newsDescription: {
    fontSize: '1rem',
    color: '#6b7280',
    lineHeight: '1.6',
    margin: '0 0 12px 0',
  },
  readMore: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: '8px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 1s linear infinite',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#9ca3af',
  },
  refreshIndicator: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: '#10b981',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '30px',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 1000,
  },
  refreshDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'white',
    animation: 'pulse 2s infinite',
  },
};