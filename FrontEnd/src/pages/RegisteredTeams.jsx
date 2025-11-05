import React, { useState, useEffect } from 'react';
import { Users, Trophy, Mail, Phone, Building2, ChevronDown, ChevronUp, Search, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom'; 
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/RegisteredTeams.css';

export default function RegisteredTeams() {
  const navigate = useNavigate();
  const { eventId } = useParams(); 

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (eventId) {
      fetchTeams();
    } else {
      setError("No Event ID provided in the URL.");
      setLoading(false);
    }
  }, [eventId]); 

  const fetchTeams = async () => {
    try {
      setLoading(true); 
      const response = await fetch(`http://localhost:8000/api/v1/team-registrations/event/${eventId}`);
      
      if (!response.ok) throw new Error('Failed to fetch teams for this event');
      const data = await response.json();
      setTeams(data.data || data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleTeamExpansion = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const handlePlayerClick = (playerId) => {
    if (playerId) {
      navigate(`/players/${playerId}`);
    } else {
      console.error("Player ID is missing, cannot navigate.");
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.captainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.captainCollege.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // ... (loading and error JSX remains the same) ...
  if (loading) {
    return (
      <>
        <Header />
        <div className="teams-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading registered teams...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="teams-container">
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={fetchTeams} className="retry-button">Retry</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="teams-container">
        {/* ... (hero section remains the same) ... */}
        <div className="teams-hero">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={20} />
            Back
          </button>
          <Trophy className="hero-icon" size={48} />
          <h1 className="hero-title">Registered Teams</h1>
          <p className="hero-subtitle">Teams registered for this event</p>
          <div className="teams-count">
            <span className="count-badge">{filteredTeams.length}</span>
            <span>Team{filteredTeams.length !== 1 ? 's' : ''} Registered</span>
          </div>
        </div>

        <div className="teams-main">
          {/* ... (search section remains the same) ... */}
          <div className="controls-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search teams, captains, or colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Teams List */}
          {filteredTeams.length === 0 ? (
            // ... (empty state remains the same) ...
            <div className="empty-state">
              <Users size={64} />
              <h3>No teams found</h3>
              <p>No teams have registered for this event yet, or none match your search.</p>
            </div>
          ) : (
            <div className="teams-grid">
              {filteredTeams.map((team) => (
                <div key={team._id || team.id} className="team-card">
                  {/* ... (team header remains the same) ... */}
                  <div className="team-header" onClick={() => toggleTeamExpansion(team._id || team.id)}>
                    <div className="team-header-content">
                      <Trophy className="team-icon" size={24} />
                      <div className="team-info">
                        <h2 className="team-name">{team.teamName}</h2>
                        <p className="team-meta">{team.captainCollege}</p>
                      </div>
                    </div>
                    <button className="expand-button">
                      {expandedTeam === (team._id || team.id) ? (
                        <ChevronUp size={24} />
                      ) : (
                        <ChevronDown size={24} />
                      )}
                    </button>
                  </div>
                  
                  {/* ... (captain summary remains the same) ... */}
                  <div className="captain-summary">
                    <h3 className="section-subtitle">
                      <Users size={18} />
                      Captain Details
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <Users className="detail-icon" size={16} />
                        <div>
                          <span className="detail-label">Name</span>
                          <span className="detail-value">{team.captainName}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Mail className="detail-icon" size={16} />
                        <div>
                          <span className="detail-label">Email</span>
                          <a href={`mailto:${team.captainEmail}`} className="detail-value email-link">
                            {team.captainEmail}
                          </a>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Phone className="detail-icon" size={16} />
                        <div>
                          <span className="detail-label">Phone</span>
                          <a href={`tel:${team.captainPhone}`} className="detail-value phone-link">
                            {team.captainPhone}
                          </a>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Building2 className="detail-icon" size={16} />
                        <div>
                          <span className="detail-label">College</span>
                          <span className="detail-value">{team.captainCollege}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content - Players List */}
                  {expandedTeam === (team._id || team.id) && (
                    <div className="team-expanded">
                      <h3 className="section-subtitle">
                        <Users size={18} />
                        Squad Members ({team.players?.length || 0} Players)
                      </h3>
                      
                      <div className="players-table-container">
                        <table className="players-display-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Player Name</th>
                              <th>Role</th>
                              <th>Year</th>
                              <th>Position</th>
                            </tr>
                          </thead>
                          <tbody>
                            {team.players?.map((player, index) => {
                              
                              // ✅ THIS IS THE ONLY CHANGE
                              // This will show you what 'player' object you're clicking on.
                              console.log("Player object from team:", player); 

                              return (
                                <tr key={player._id || index} className={`
                                  ${player.isCaptain ? 'captain-row' : ''}
                                  ${player.isViceCaptain ? 'vice-captain-row' : ''}
                                `}>
                                  <td className="player-number">{index + 1}</td>
                                  
                                  <td 
                                    className="player-name player-link"
                                    onClick={() => handlePlayerClick(player._id)}
                                    title={`View ${player.name}'s profile`}
                                  >
                                    {player.name}
                                    {player.isCaptain && <span className="badge badge-captain">C</span>}
                                    {player.isViceCaptain && <span className="badge badge-vice">VC</span>}
                                  </td>
                                  
                                  <td className="player-role">
                                    <span className={`role-badge role-${player.role?.toLowerCase().replace(/[^a-z]/g, '')}`}>
                                      {player.role}
                                    </span>
                                  </td>
                                  <td>{player.year}</td>
                                  <td>
                                    {player.isCaptain && <span className="position-label">Captain</span>}
                                    {player.isViceCaptain && <span className="position-label">Vice-Captain</span>}
                                    {!player.isCaptain && !player.isViceCaptain && <span className="position-label">Player</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* ... (team stats section remains the same) ... */}
                      <div className="team-stats">
                        <h4 className="stats-title">Team Composition</h4>
                        <div className="stats-grid">
                          <div className="stat-item">
                            <span className="stat-label">Batsmen</span>
                            <span className="stat-value">
                              {team.players?.filter(p => p.role === 'Batsman').length || 0}
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Bowlers</span>
                            <span className="stat-value">
                              {team.players?.filter(p => p.role === 'Bowler').length || 0}
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">All-rounders</span>
                            <span className="stat-value">
                              {team.players?.filter(p => p.role === 'All-rounder').length || 0}
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Wicket-keepers</span>
                            <span className="stat-value">
                              {team.players?.filter(p => p.role === 'Wicket-keeper').length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}