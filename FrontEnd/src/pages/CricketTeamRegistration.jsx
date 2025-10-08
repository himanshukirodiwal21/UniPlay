// src/pages/CricketTeamRegistration.jsx
import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

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
        return;
      }

      setSubmitSuccess(true);
      setShowErrors(false);
      alert('Team Registered Successfully ✅');
      // console.log('Registration response:', data);

      setTimeout(() => {
        navigate('/'); // Home page par redirect
      }, 2000);

    } catch (err) {
      console.error('Network error:', err);
      alert('Network error while submitting.');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cricket Team Registration</h1>
            <p className="text-gray-600">Complete all fields to register your team for the tournament</p>
            {!eventId && <p className="text-sm text-red-600 mt-2">Registration can't proceed: event not selected.</p>}
          </div>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <p className="text-green-800 font-semibold">Registration Successful!</p>
                  <p className="text-green-700 text-sm">Your team has been registered. You'll receive a confirmation email shortly.</p>
                </div>
              </div>
            </div>
          )}

          {/* Team & Captain Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Team & Captain Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team Name" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${showErrors && !teamName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Captain Name *</label>
                <input type="text" value={captainName} onChange={(e) => setCaptainName(e.target.value)} placeholder="Captain Name" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${showErrors && !captainName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College/Institution *</label>
                <input type="text" value={captainCollege} onChange={(e) => setCaptainCollege(e.target.value)} placeholder="College Name" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${showErrors && !captainCollege ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" value={captainEmail} onChange={(e) => setCaptainEmail(e.target.value)} placeholder="Email" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${showErrors && !captainEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" value={captainPhone} onChange={(e) => setCaptainPhone(e.target.value)} placeholder="Phone" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${showErrors && !captainPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
              </div>
            </div>
          </div>

          {/* Players Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="bg-blue-700 px-6 py-3">
              <h2 className="text-lg font-bold text-white">Squad Members (15 Players)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold w-12">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Player Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Year</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold w-24">Captain</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold w-24">Vice-Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <React.Fragment key={player.id}>
                      <tr className={`border-b border-gray-100 hover:bg-gray-50 ${player.errors.length > 0 && showErrors ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-3 font-semibold text-gray-600 text-sm">{player.id}</td>
                        <td className="px-4 py-3">
                          <input type="text" placeholder="Name" value={player.name} onChange={(e) => updatePlayer(player.id, 'name', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                        </td>
                        <td className="px-4 py-3">
                          <select value={player.role} onChange={(e) => updatePlayer(player.id, 'role', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">Select</option>
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select value={player.year} onChange={(e) => updatePlayer(player.id, 'year', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">Select</option>
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input type="checkbox" checked={player.isCaptain} onChange={(e) => updatePlayer(player.id, 'isCaptain', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input type="checkbox" checked={player.isViceCaptain} onChange={(e) => updatePlayer(player.id, 'isViceCaptain', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                        </td>
                      </tr>
                      {player.errors.length > 0 && showErrors && (
                        <tr className="bg-red-100 border-b border-red-200">
                          <td colSpan="6" className="px-4 py-2">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                              <div className="text-sm">
                                {player.errors.map((err, idx) => <p key={idx} className="text-red-700 font-medium">• {err}</p>)}
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

          <div className="flex justify-center">
            <button type="button" onClick={handleSubmit} disabled={!eventId} className="px-12 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
              Submit Registration
            </button>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
