// src/pages/CricketTeamRegistration.jsx
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Users, Trophy, Mail, Phone, Building2 } from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/CricketTeamRegistration.css';

export default function CricketTeamRegistration() {
  const { eventId: paramEventId } = useParams();
  const location = useLocation();
  const eventFromState = location.state?.event;
  const eventId = paramEventId || eventFromState?._id || eventFromState?.id || null;
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [captainCollege, setCaptainCollege] = useState('');

  const [players, setPlayers] = useState(
    Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: '',
      role: '',
      year: '',
      isCaptain: false,
      isViceCaptain: false,
      errors: []
    }))
  );

  const [showErrors, setShowErrors] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];

  const updatePlayer = (id, field, value) => {
    if ((field === 'isCaptain' || field === 'isViceCaptain') && value) {
      const player = players.find(p => p.id === id);
      if (!player.name || !player.role || !player.year) {
        alert('Please fill Name, Role and Year before selecting Captain/Vice-Captain');
        return;
      }
      if (field === 'isCaptain') {
        const existingCaptain = players.find(p => p.isCaptain && p.id !== id);
        if (existingCaptain) {
          alert('A captain is already selected. Uncheck that first.');
          return;
        }
      }
      if (field === 'isViceCaptain') {
        const existingVice = players.find(p => p.isViceCaptain && p.id !== id);
        if (existingVice) {
          alert('A vice-captain is already selected. Uncheck that first.');
          return;
        }
      }
    }

    setPlayers(prev =>
      prev.map(p => {
        if (p.id === id) {
          if (field === 'isCaptain' && value) return { ...p, isCaptain: true, isViceCaptain: false, errors: [] };
          if (field === 'isViceCaptain' && value) return { ...p, isViceCaptain: true, isCaptain: false, errors: [] };
          return { ...p, [field]: value, errors: [] };
        }
        return p;
      })
    );
    setShowErrors(false);
    setSubmitSuccess(false);
  };

  const validatePlayers = () => {
    let isValid = true;
    let updatedPlayers = players.map(player => {
      const playerErrors = [];
      const hasData = player.name || player.role || player.year || player.isCaptain || player.isViceCaptain;

      if (hasData) {
        if (!player.name) playerErrors.push('Name is required');
        if (!player.role) playerErrors.push('Role must be selected');
        if (!player.year) playerErrors.push('Year must be selected');
      }

      return { ...player, errors: playerErrors };
    });

    const filledPlayers = updatedPlayers.filter(p => p.name && p.role && p.year);

    if (filledPlayers.length !== 15) {
      isValid = false;
      updatedPlayers = updatedPlayers.map(p => {
        if (!p.name || !p.role || !p.year) return { ...p, errors: [...p.errors, 'This player slot must be filled'] };
        return p;
      });
    }

    const captains = filledPlayers.filter(p => p.isCaptain);
    if (captains.length !== 1) {
      isValid = false;
      if (captains.length === 0) {
        updatedPlayers[0] = { ...updatedPlayers[0], errors: [...updatedPlayers[0].errors, 'One player must be selected as Captain'] };
      } else {
        updatedPlayers = updatedPlayers.map(p => p.isCaptain ? { ...p, errors: [...p.errors, 'Only one Captain allowed'] } : p);
      }
    }

    const viceCaptains = filledPlayers.filter(p => p.isViceCaptain);
    if (viceCaptains.length !== 1) {
      isValid = false;
      if (viceCaptains.length === 0) {
        updatedPlayers[1] = { ...updatedPlayers[1], errors: [...updatedPlayers[1].errors, 'One player must be selected as Vice-Captain'] };
      } else {
        updatedPlayers = updatedPlayers.map(p => p.isViceCaptain ? { ...p, errors: [...p.errors, 'Only one Vice-Captain allowed'] } : p);
      }
    }

    const bowlersAndAllRounders = filledPlayers.filter(p => p.role === 'Bowler' || p.role === 'All-rounder');
    if (bowlersAndAllRounders.length < 5) {
      isValid = false;
      const idx = updatedPlayers.findIndex(p => p.name && p.role !== 'Bowler' && p.role !== 'All-rounder');
      if (idx !== -1) updatedPlayers[idx] = { ...updatedPlayers[idx], errors: [...updatedPlayers[idx].errors, `Need minimum 5 Bowlers/All-rounders (currently ${bowlersAndAllRounders.length})`] };
    }

    const wicketKeepers = filledPlayers.filter(p => p.role === 'Wicket-keeper');
    if (wicketKeepers.length < 2) {
      isValid = false;
      const idx = updatedPlayers.findIndex(p => p.name && p.role !== 'Wicket-keeper');
      if (idx !== -1) updatedPlayers[idx] = { ...updatedPlayers[idx], errors: [...updatedPlayers[idx].errors, `Need minimum 2 Wicket-keepers (currently ${wicketKeepers.length})`] };
    }

    if (!teamName || !captainName || !captainEmail || !captainPhone || !captainCollege) isValid = false;

    return { isValid, updatedPlayers, filledPlayers };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventId) {
      alert('Event not specified. Please open registration from the event details page.');
      return;
    }

    const { isValid, updatedPlayers, filledPlayers } = validatePlayers();
    setPlayers(updatedPlayers);
    setShowErrors(true);

    if (!isValid) {
      setSubmitSuccess(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      eventId,
      teamName,
      captainName,
      captainEmail,
      captainPhone,
      captainCollege,
      players: filledPlayers
    };

    try {
      const response = await fetch('http://localhost:8000/api/v1/team-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data?.message || 'Failed to register team.');
        console.error('Server response:', data);
        setIsSubmitting(false);
        return;
      }

      setSubmitSuccess(true);
      setShowErrors(false);
      alert('Team Registered Successfully ✅');

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error('Network error:', err);
      alert('Network error while submitting.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="registration-container">
        <div className="registration-hero">
          <div className="hero-content">
            <Trophy className="hero-icon" size={48} />
            <h1 className="hero-title">Cricket Team Registration</h1>
            <p className="hero-subtitle">Complete all fields to register your team for the tournament</p>
            {!eventId && (
              <div className="warning-badge">
                <AlertCircle size={16} />
                <span>Registration can't proceed: event not selected</span>
              </div>
            )}
          </div>
        </div>

        <main className="registration-main">
          {submitSuccess && (
            <div className="success-banner">
              <CheckCircle className="success-icon" size={28} />
              <div className="success-content">
                <p className="success-title">Registration Successful!</p>
                <p className="success-text">Your team has been registered. You'll receive a confirmation email shortly.</p>
              </div>
            </div>
          )}

          {/* Team & Captain Details */}
          <div className="section-card">
            <div className="section-header">
              <Users size={24} />
              <h2 className="section-title">Team & Captain Details</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <Trophy size={16} />
                  Team Name *
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className={`form-input ${showErrors && !teamName ? 'input-error' : ''}`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Users size={16} />
                  Captain Name *
                </label>
                <input
                  type="text"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  placeholder="Enter captain's name"
                  className={`form-input ${showErrors && !captainName ? 'input-error' : ''}`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Building2 size={16} />
                  College/Institution *
                </label>
                <input
                  type="text"
                  value={captainCollege}
                  onChange={(e) => setCaptainCollege(e.target.value)}
                  placeholder="Enter college name"
                  className={`form-input ${showErrors && !captainCollege ? 'input-error' : ''}`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={captainEmail}
                  onChange={(e) => setCaptainEmail(e.target.value)}
                  placeholder="captain@example.com"
                  className={`form-input ${showErrors && !captainEmail ? 'input-error' : ''}`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className={`form-input ${showErrors && !captainPhone ? 'input-error' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Players Table */}
          <div className="section-card players-section">
            <div className="players-header">
              <Users size={24} />
              <h2 className="section-title">Squad Members (15 Players Required)</h2>
            </div>
            <div className="table-container">
              <table className="players-table">
                <thead>
                  <tr>
                    <th className="th-number">#</th>
                    <th className="th-name">Player Name</th>
                    <th className="th-role">Role</th>
                    <th className="th-year">Year</th>
                    <th className="th-check">Captain</th>
                    <th className="th-check">Vice-Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <React.Fragment key={player.id}>
                      <tr className={`player-row ${player.errors.length > 0 && showErrors ? 'row-error' : ''} ${player.isCaptain ? 'row-captain' : ''} ${player.isViceCaptain ? 'row-vice' : ''}`}>
                        <td className="td-number">
                          <span className="player-number">{player.id}</span>
                        </td>
                        <td className="td-input">
                          <input
                            type="text"
                            placeholder="Enter player name"
                            value={player.name}
                            onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                            className="table-input"
                          />
                        </td>
                        <td className="td-select">
                          <select
                            value={player.role}
                            onChange={(e) => updatePlayer(player.id, 'role', e.target.value)}
                            className="table-select"
                          >
                            <option value="">Select Role</option>
                            {roles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </td>
                        <td className="td-select">
                          <select
                            value={player.year}
                            onChange={(e) => updatePlayer(player.id, 'year', e.target.value)}
                            className="table-select"
                          >
                            <option value="">Select Year</option>
                            {years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </td>
                        <td className="td-check">
                          <input
                            type="checkbox"
                            checked={player.isCaptain}
                            onChange={(e) => updatePlayer(player.id, 'isCaptain', e.target.checked)}
                            className="table-checkbox"
                          />
                        </td>
                        <td className="td-check">
                          <input
                            type="checkbox"
                            checked={player.isViceCaptain}
                            onChange={(e) => updatePlayer(player.id, 'isViceCaptain', e.target.checked)}
                            className="table-checkbox"
                          />
                        </td>
                      </tr>
                      {player.errors.length > 0 && showErrors && (
                        <tr className="error-row">
                          <td colSpan="6">
                            <div className="error-content">
                              <AlertCircle className="error-icon" size={18} />
                              <div className="error-list">
                                {player.errors.map((err, idx) => (
                                  <p key={idx}>• {err}</p>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="submit-section">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!eventId || isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? (
                <>
                  <div className="button-spinner"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Trophy size={20} />
                  <span>Submit Registration</span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}