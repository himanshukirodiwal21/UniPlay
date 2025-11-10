// scripts/linkPlayers.js
// Run with: node scripts/linkPlayers.js

import mongoose from 'mongoose';
import TeamRegistration from '../models/teamRegistration.model.js';
import { Player } from '../models/player.model.js';
import dotenv from 'dotenv';

dotenv.config();

const linkPlayersToTeam = async (teamId) => {
  try {
    const team = await TeamRegistration.findById(teamId);
    
    if (!team) {
      console.log(`❌ Team not found: ${teamId}`);
      return;
    }

    console.log(`\n🔗 Linking players for team: ${team.teamName}`);
    let linkedCount = 0;
    let createdCount = 0;

    for (let teamPlayer of team.players) {
      // Skip if already linked
      if (teamPlayer.playerId) {
        console.log(`  ✅ Already linked: ${teamPlayer.name}`);
        linkedCount++;
        continue;
      }

      // Search for existing player in Player collection
      let player = await Player.findOne({ 
        name: teamPlayer.name,
        role: teamPlayer.role 
      });

      if (!player) {
        // Create new player
        player = await Player.create({
          name: teamPlayer.name,
          role: teamPlayer.role,
          teams: [team._id],
          battingStats: {
            totalRuns: 0,
            ballsFaced: 0,
            outs: 0,
            highestScore: 0,
            battingAverage: 0,
            strikeRate: 0,
            centuries: 0,
            halfCenturies: 0,
            fours: 0,
            sixes: 0
          },
          bowlingStats: {
            ballsBowled: 0,
            runsConceded: 0,
            wicketsTaken: 0,
            bestFigures: '0/0',
            bowlingAverage: 0,
            economy: 0,
            strikeRate: 0,
            fourWickets: 0,
            fiveWickets: 0
          }
        });
        console.log(`  ✨ Created new player: ${teamPlayer.name} (${player._id})`);
        createdCount++;
      } else {
        // Add team to existing player if not already there
        if (!player.teams.includes(team._id)) {
          player.teams.push(team._id);
          await player.save();
        }
        console.log(`  🔗 Linked existing player: ${teamPlayer.name} (${player._id})`);
      }

      // Link player to team
      teamPlayer.playerId = player._id;
      linkedCount++;
    }

    // Save team with updated player links
    await team.save();

    console.log(`\n✅ Team "${team.teamName}" completed:`);
    console.log(`   - Players linked: ${linkedCount}`);
    console.log(`   - New players created: ${createdCount}`);

  } catch (err) {
    console.error(`❌ Error linking players for team ${teamId}:`, err.message);
  }
};

const linkAllTeamsInEvent = async (eventId) => {
  try {
    console.log(`\n🚀 Starting player linking for event: ${eventId}\n`);
    
    const teams = await TeamRegistration.find({ eventId });
    
    if (teams.length === 0) {
      console.log('❌ No teams found for this event');
      return;
    }

    console.log(`📋 Found ${teams.length} teams to process\n`);

    for (const team of teams) {
      await linkPlayersToTeam(team._id);
    }

    console.log(`\n🎉 All teams processed successfully!\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

// ============= MAIN EXECUTION =============
const main = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database');
    console.log('✅ MongoDB connected\n');

    // ✅ OPTION 1: Link specific team
    // await linkPlayersToTeam('690a47ab1f481558a723c9fd');

    // ✅ OPTION 2: Link all teams in an event
    await linkAllTeamsInEvent('69032e46789511311b365ad1'); // Your event ID

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
    process.exit(0);

  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  }
};

main();