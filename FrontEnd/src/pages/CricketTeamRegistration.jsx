import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function CricketTeamRegistration() {
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
    // Validate fields before allowing captain/vice-captain selection
    if ((field === 'isCaptain' || field === 'isViceCaptain') && value) {
      const player = players.find(p => p.id === id);
      if (!player.name || !player.role || !player.year) {
        alert('Please fill in Name, Role, and Year before selecting Captain/Vice-Captain');
        return;
      }
      
      // Check if another captain/vice-captain is already selected
      if (field === 'isCaptain') {
        const existingCaptain = players.find(p => p.isCaptain && p.id !== id);
        if (existingCaptain) {
          alert('A captain is already selected. Please uncheck the existing captain first.');
          return;
        }
      }
      
      if (field === 'isViceCaptain') {
        const existingViceCaptain = players.find(p => p.isViceCaptain && p.id !== id);
        if (existingViceCaptain) {
          alert('A vice-captain is already selected. Please uncheck the existing vice-captain first.');
          return;
        }
      }
    }

    setPlayers(players.map(p => {
      if (p.id === id) {
        let updates = { [field]: value, errors: [] };
        
        // Prevent being both captain and vice-captain
        if (field === 'isCaptain' && value) {
          return { ...p, isCaptain: true, isViceCaptain: false, errors: [] };
        }
        
        if (field === 'isViceCaptain' && value) {
          return { ...p, isViceCaptain: true, isCaptain: false, errors: [] };
        }
        
        return { ...p, ...updates };
      }
      return p;
    }));
    setShowErrors(false);
    setSubmitSuccess(false);
  };

  const validateAndSubmit = () => {
    let isValid = true;
    let updatedPlayers = [...players];
    
    updatedPlayers = updatedPlayers.map(player => {
      const playerErrors = [];
      const hasData = player.name || player.role || player.year || player.isCaptain || player.isViceCaptain;
      
      if (hasData) {
        if (!player.name || player.name.trim() === '') playerErrors.push('Name is required');
        if (!player.role) playerErrors.push('Role must be selected');
        if (!player.year) playerErrors.push('Year must be selected');
      }
      
      if (playerErrors.length > 0) isValid = false;
      return { ...player, errors: playerErrors };
    });

    const filledPlayers = updatedPlayers.filter(p => p.name && p.role && p.year);
    
    if (filledPlayers.length !== 15) {
      isValid = false;
      updatedPlayers = updatedPlayers.map(p => {
        if (!p.name && !p.role && !p.year) {
          return { ...p, errors: ['This player slot must be filled'] };
        }
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
      if (idx !== -1) {
        updatedPlayers[idx] = {
          ...updatedPlayers[idx],
          errors: [...updatedPlayers[idx].errors, `Need minimum 5 Bowlers/All-rounders (currently ${bowlersAndAllRounders.length})`]
        };
      }
    }

    const wicketKeepers = filledPlayers.filter(p => p.role === 'Wicket-keeper');
    if (wicketKeepers.length < 2) {
      isValid = false;
      const idx = updatedPlayers.findIndex(p => p.name && p.role !== 'Wicket-keeper');
      if (idx !== -1) {
        updatedPlayers[idx] = {
          ...updatedPlayers[idx],
          errors: [...updatedPlayers[idx].errors, `Need minimum 2 Wicket-keepers (currently ${wicketKeepers.length})`]
        };
      }
    }

    if (!teamName || !captainName || !captainEmail || !captainPhone || !captainCollege) {
      isValid = false;
    }

    setPlayers(updatedPlayers);
    setShowErrors(true);

    if (isValid) {
      setSubmitSuccess(true);
      console.log('Team registered:', { teamName, captainName, captainEmail, captainPhone, captainCollege, players: filledPlayers });
    } else {
      setSubmitSuccess(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cricket Team Registration</h1>
          <p className="text-gray-600">Complete all fields to register your team for the tournament</p>
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

        {/* Captain & Team Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Team & Captain Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., CSE Titans"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${showErrors && !teamName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {showErrors && !teamName && <p className="text-red-600 text-xs mt-1">Required</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Captain Name *</label>
              <input
                type="text"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                placeholder="Full name"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${showErrors && !captainName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {showErrors && !captainName && <p className="text-red-600 text-xs mt-1">Required</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College/Institution *</label>
              <input
                type="text"
                value={captainCollege}
                onChange={(e) => setCaptainCollege(e.target.value)}
                placeholder="College name"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${showErrors && !captainCollege ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {showErrors && !captainCollege && <p className="text-red-600 text-xs mt-1">Required</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={captainEmail}
                onChange={(e) => setCaptainEmail(e.target.value)}
                placeholder="captain@email.com"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${showErrors && !captainEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {showErrors && !captainEmail && <p className="text-red-600 text-xs mt-1">Required</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={captainPhone}
                onChange={(e) => setCaptainPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${showErrors && !captainPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {showErrors && !captainPhone && <p className="text-red-600 text-xs mt-1">Required</p>}
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
                {players.map((player, index) => (
                  <React.Fragment key={player.id}>
                    <tr className={`border-b border-gray-100 hover:bg-gray-50 ${player.errors.length > 0 && showErrors ? 'bg-red-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 font-semibold text-gray-600 text-sm">{player.id}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Enter player name"
                          value={player.name}
                          onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={player.role}
                          onChange={(e) => updatePlayer(player.id, 'role', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select</option>
                          {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={player.year}
                          onChange={(e) => updatePlayer(player.id, 'year', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={player.isCaptain}
                          onChange={(e) => updatePlayer(player.id, 'isCaptain', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={player.isViceCaptain}
                          onChange={(e) => updatePlayer(player.id, 'isViceCaptain', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                    {player.errors.length > 0 && showErrors && (
                      <tr className="bg-red-100 border-b border-red-200">
                        <td colSpan="6" className="px-4 py-2">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                            <div className="text-sm">
                              {player.errors.map((error, idx) => (
                                <p key={idx} className="text-red-700 font-medium">• {error}</p>
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

        <div className="flex justify-center">
          <button
            onClick={validateAndSubmit}
            className="px-12 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Submit Registration
          </button>
        </div>
      </main>
    </div>
  );
}