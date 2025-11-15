// src/utils/cricsheetParser.js

/**
 * Parses Cricsheet JSON format into our AutoPlay format
 * Cricsheet format: https://cricsheet.org/format/json/
 */

export const parseCricsheetJSON = (cricsheetData) => {
  try {
    const { meta, info, innings } = cricsheetData;
    
    // Extract match metadata
    const matchInfo = {
      matchType: info.match_type || 'T20',
      gender: info.gender || 'male',
      venue: info.venue || 'Unknown',
      city: info.city || 'Unknown',
      dates: info.dates || [],
      teams: info.teams || [],
      tossWinner: info.toss?.winner || null,
      tossDecision: info.toss?.decision || null,
    };
    
    // Extract all unique player names for mapping
    const allPlayers = new Set();
    
    // Parse innings
    const parsedInnings = innings.map((inning, idx) => {
      const inningsNumber = idx + 1;
      const team = inning.team;
      const otherTeam = info.teams.find(t => t !== team);
      
      const balls = [];
      let ballCounter = 1;
      
      // Cricsheet structure: innings → overs → deliveries
      inning.overs.forEach((over) => {
        over.deliveries.forEach((delivery) => {
          const overNum = over.over;
          const ballNum = delivery.ball || 1;
          const overString = `${overNum}.${ballNum}`;
          
          // Extract batsman and bowler
          const batsmanName = delivery.batter || delivery.batsman || 'Unknown';
          const bowlerName = delivery.bowler || 'Unknown';
          const nonStriker = delivery.non_striker || '';
          
          allPlayers.add(batsmanName);
          allPlayers.add(bowlerName);
          if (nonStriker) allPlayers.add(nonStriker);
          
          // Extract runs
          const runsData = delivery.runs || {};
          const batsmanRuns = runsData.batter || 0;
          const totalRuns = runsData.total || batsmanRuns;
          const extras = runsData.extras || 0;
          
          // Determine extras type
          let extrasType = 'none';
          if (delivery.extras) {
            if (delivery.extras.wides) extrasType = 'wides';
            else if (delivery.extras.noballs) extrasType = 'noballs';
            else if (delivery.extras.byes) extrasType = 'byes';
            else if (delivery.extras.legbyes) extrasType = 'legbyes';
          }
          
          // Check for wicket
          let isWicket = false;
          let wicketType = 'none';
          let dismissedPlayerName = '';
          
          if (delivery.wickets && delivery.wickets.length > 0) {
            isWicket = true;
            const wicket = delivery.wickets[0];
            wicketType = wicket.kind || 'caught';
            dismissedPlayerName = wicket.player_out || batsmanName;
            allPlayers.add(dismissedPlayerName);
          }
          
          // Generate commentary
          let commentary = '';
          if (isWicket) {
            commentary = `WICKET! ${dismissedPlayerName} is out ${wicketType}!`;
          } else if (batsmanRuns === 6) {
            commentary = `SIX! ${batsmanName} clears the boundary!`;
          } else if (batsmanRuns === 4) {
            commentary = `FOUR! Beautiful shot by ${batsmanName}!`;
          } else if (extrasType === 'wides') {
            commentary = `Wide ball by ${bowlerName}`;
          } else if (extrasType === 'noballs') {
            commentary = `No ball by ${bowlerName}`;
          } else if (batsmanRuns === 0) {
            commentary = `Dot ball, ${bowlerName} to ${batsmanName}`;
          } else {
            commentary = `${batsmanRuns} run${batsmanRuns > 1 ? 's' : ''} to ${batsmanName}`;
          }
          
          balls.push({
            ballNumber: ballCounter++,
            over: overString,
            batsmanName,
            bowlerName,
            nonStriker,
            runs: batsmanRuns,
            extras,
            extrasType,
            isWicket,
            wicketType,
            dismissedPlayerName,
            commentary,
            reviewType: delivery.review?.type || null,
          });
        });
      });
      
      return {
        inningsNumber,
        battingTeam: team,
        bowlingTeam: otherTeam,
        balls
      };
    });
    
    return {
      matchInfo,
      innings: parsedInnings,
      allPlayerNames: Array.from(allPlayers)
    };
    
  } catch (error) {
    console.error('❌ Cricsheet parsing error:', error);
    throw new Error(`Failed to parse Cricsheet JSON: ${error.message}`);
  }
};

/**
 * Maps player names to Player IDs from database
 */
export const mapPlayersToIds = async (playerNames, Player, teams) => {
  const playerMapping = new Map();
  
  for (const name of playerNames) {
    try {
      // Try to find exact match first
      let player = await Player.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
      });
      
      // If not found, create a new player
      if (!player) {
        player = await Player.create({
          name: name,
          teams: teams, // Link to both teams
        });
        console.log(`✅ Created new player: ${name}`);
      }
      
      playerMapping.set(name, {
        playerId: player._id,
        playerName: player.name,
        team: null // Will be set during innings processing
      });
      
    } catch (error) {
      console.error(`❌ Error mapping player ${name}:`, error);
      throw error;
    }
  }
  
  return playerMapping;
};

/**
 * Validates Cricsheet JSON structure
 */
export const validateCricsheetJSON = (data) => {
  const errors = [];
  
  if (!data.info) {
    errors.push('Missing "info" field');
  }
  
  if (!data.innings || !Array.isArray(data.innings)) {
    errors.push('Missing or invalid "innings" field');
  }
  
  if (data.innings) {
    data.innings.forEach((inning, idx) => {
      if (!inning.team) {
        errors.push(`Innings ${idx + 1}: Missing "team" field`);
      }
      if (!inning.overs || !Array.isArray(inning.overs)) {
        errors.push(`Innings ${idx + 1}: Missing or invalid "overs" field`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};