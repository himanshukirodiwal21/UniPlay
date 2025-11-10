// src/controllers/player.controller.js
import { Player } from "../models/player.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import TeamRegistration from "../models/teamRegistration.model.js";

// ============================================
// ✅ EXISTING FUNCTIONS - DON'T REMOVE THESE
// ============================================

// @desc    Get all players
// @route   GET /api/v1/players
// @access  Public
export const getAllPlayers = asyncHandler(async (req, res) => {
  const players = await Player.find({});

  if (!players || players.length === 0) {
    throw new ApiError(404, "No players found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, players, "Players fetched successfully"));
});

// @desc    Get single player profile
// @route   GET /api/v1/players/:id
// @access  Public
export const getPlayerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("🔍 Fetching player with ID:", id);

  if (!mongoose.isValidObjectId(id)) {
    console.error("❌ Invalid ObjectId format:", id);
    throw new ApiError(400, "Invalid Player ID format");
  }

  const player = await Player.findById(id).populate({
    path: "teams",
    select: "teamName eventId captainName"
  });

  if (!player) {
    console.error("❌ Player not found in database:", id);
    throw new ApiError(404, "Player not found");
  }

  console.log("✅ Player found:", player.name);

  return res
    .status(200)
    .json(new ApiResponse(200, player, "Player profile fetched successfully"));
});

// @desc    Fix all players - add missing stats
// @route   GET /api/v1/players/fix-stats
// @access  Public
export const fixPlayerStats = asyncHandler(async (req, res) => {
  const players = await Player.find({});
  
  let updated = 0;
  
  for (const player of players) {
    let needsUpdate = false;
    
    if (!player.battingStats || Object.keys(player.battingStats).length === 0) {
      player.battingStats = {
        matchesPlayed: 0,
        innings: 0,
        totalRuns: 0,
        ballsFaced: 0,
        fifties: 0,
        hundreds: 0,
        highScore: 0,
        outs: 0
      };
      needsUpdate = true;
    }
    
    if (!player.bowlingStats || Object.keys(player.bowlingStats).length === 0) {
      player.bowlingStats = {
        matchesPlayed: 0,
        innings: 0,
        ballsBowled: 0,
        runsConceded: 0,
        wicketsTaken: 0,
        fiveWicketHauls: 0
      };
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await player.save();
      updated++;
      console.log(`✅ Fixed stats for: ${player.name}`);
    }
  }
  
  return res.status(200).json(
    new ApiResponse(200, { updated, total: players.length }, `Fixed ${updated} out of ${players.length} players`)
  );
});

// ============================================
// ✅ EXISTING LINKING FUNCTIONS
// ============================================

// @desc    Link team player to Player collection
// @route   POST /api/v1/players/teams/:teamId/players/:teamPlayerId/link
// @access  Public
export const linkTeamPlayerToPlayer = asyncHandler(async (req, res) => {
  const { teamId, teamPlayerId } = req.params;
  const { playerName } = req.body;

  // Find or create player in Player collection
  let player = await Player.findOne({ name: playerName });
  
  if (!player) {
    player = await Player.create({
      name: playerName,
      teams: [teamId],
      battingStats: {
        matchesPlayed: 0,
        innings: 0,
        totalRuns: 0,
        ballsFaced: 0,
        fifties: 0,
        hundreds: 0,
        highScore: 0,
        outs: 0,
      },
      bowlingStats: {
        matchesPlayed: 0,
        innings: 0,
        ballsBowled: 0,
        runsConceded: 0,
        wicketsTaken: 0,
        fiveWicketHauls: 0,
      },
    });
    console.log(`✅ New player created: ${playerName}`);
  } else if (!player.teams.includes(teamId)) {
    player.teams.push(teamId);
    await player.save();
  }

  // Update team registration with playerId reference
  const team = await TeamRegistration.findById(teamId);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  const teamPlayer = team.players.id(teamPlayerId);
  if (!teamPlayer) {
    throw new ApiError(404, 'Player not found in team');
  }

  teamPlayer.playerId = player._id;
  await team.save();

  return res.status(200).json(
    new ApiResponse(200, { player, teamPlayer }, 'Player linked successfully')
  );
});

// @desc    Auto-link all players in a team
// @route   POST /api/v1/players/teams/:teamId/link-all-players
// @access  Public
export const autoLinkTeamPlayers = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  
  const team = await TeamRegistration.findById(teamId);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  let linkedCount = 0;
  let alreadyLinkedCount = 0;

  for (const teamPlayer of team.players) {
    if (!teamPlayer.playerId) {
      // Find or create player
      let player = await Player.findOne({ name: teamPlayer.name });
      
      if (!player) {
        player = await Player.create({
          name: teamPlayer.name,
          teams: [teamId],
          battingStats: {
            matchesPlayed: 0,
            innings: 0,
            totalRuns: 0,
            ballsFaced: 0,
            fifties: 0,
            hundreds: 0,
            highScore: 0,
            outs: 0,
          },
          bowlingStats: {
            matchesPlayed: 0,
            innings: 0,
            ballsBowled: 0,
            runsConceded: 0,
            wicketsTaken: 0,
            fiveWicketHauls: 0,
          },
        });
        console.log(`✅ Created player: ${teamPlayer.name}`);
      } else if (!player.teams.includes(teamId)) {
        player.teams.push(teamId);
        await player.save();
        console.log(`✅ Added team to existing player: ${teamPlayer.name}`);
      }

      teamPlayer.playerId = player._id;
      linkedCount++;
    } else {
      alreadyLinkedCount++;
    }
  }

  await team.save();

  return res.status(200).json(
    new ApiResponse(
      200, 
      { 
        team, 
        linkedCount, 
        alreadyLinkedCount,
        totalPlayers: team.players.length 
      }, 
      `${linkedCount} players linked successfully. ${alreadyLinkedCount} were already linked.`
    )
  );
});

// ============================================
// ✅✅✅ NEW BULK LINKING FUNCTIONS - ADD THESE ✅✅✅
// ============================================

/* -------------------------------------------------------
   🔗 Link All Players in a Single Team
   POST /api/v1/players/link-team/:teamId
-------------------------------------------------------- */
export const linkTeamPlayers = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await TeamRegistration.findById(teamId);
  
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  let linkedCount = 0;
  let createdCount = 0;
  let alreadyLinkedCount = 0;

  console.log(`\n🔗 Linking players for team: ${team.teamName}`);

  for (let teamPlayer of team.players) {
    if (teamPlayer.playerId) {
      console.log(`  ✅ Already linked: ${teamPlayer.name}`);
      alreadyLinkedCount++;
      continue;
    }

    let player = await Player.findOne({ 
      name: teamPlayer.name,
      role: teamPlayer.role 
    });

    if (!player) {
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
      if (!player.teams.includes(team._id)) {
        player.teams.push(team._id);
        await player.save();
      }
      console.log(`  🔗 Linked existing player: ${teamPlayer.name} (${player._id})`);
    }

    teamPlayer.playerId = player._id;
    linkedCount++;
  }

  await team.save();

  console.log(`\n✅ Team "${team.teamName}" completed:`);
  console.log(`   - Already linked: ${alreadyLinkedCount}`);
  console.log(`   - Newly linked: ${linkedCount}`);
  console.log(`   - New players created: ${createdCount}\n`);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        teamName: team.teamName,
        totalPlayers: team.players.length,
        alreadyLinked: alreadyLinkedCount,
        newlyLinked: linkedCount,
        playersCreated: createdCount
      },
      `Players linked successfully for team "${team.teamName}"`
    )
  );
});

/* -------------------------------------------------------
   🔗 Link All Players in All Teams of an Event
   POST /api/v1/players/link-event/:eventId
-------------------------------------------------------- */
export const linkEventPlayers = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const teams = await TeamRegistration.find({ eventId });
  
  if (teams.length === 0) {
    throw new ApiError(404, "No teams found for this event");
  }

  console.log(`\n🚀 Starting player linking for event: ${eventId}`);
  console.log(`📋 Found ${teams.length} teams to process\n`);

  let totalLinked = 0;
  let totalCreated = 0;
  let processedTeams = [];

  for (const team of teams) {
    let linkedCount = 0;
    let createdCount = 0;
    let alreadyLinked = 0;

    console.log(`\n🔗 Processing team: ${team.teamName}`);

    for (let teamPlayer of team.players) {
      if (teamPlayer.playerId) {
        alreadyLinked++;
        continue;
      }

      let player = await Player.findOne({ 
        name: teamPlayer.name,
        role: teamPlayer.role 
      });

      if (!player) {
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
        console.log(`  ✨ Created: ${teamPlayer.name}`);
        createdCount++;
      } else {
        if (!player.teams.includes(team._id)) {
          player.teams.push(team._id);
          await player.save();
        }
        console.log(`  🔗 Linked: ${teamPlayer.name}`);
      }

      teamPlayer.playerId = player._id;
      linkedCount++;
    }

    await team.save();

    totalLinked += linkedCount;
    totalCreated += createdCount;
    
    processedTeams.push({
      teamName: team.teamName,
      alreadyLinked,
      newlyLinked: linkedCount,
      created: createdCount
    });

    console.log(`✅ Team "${team.teamName}": ${linkedCount} linked, ${createdCount} created`);
  }

  console.log(`\n🎉 All teams processed successfully!`);
  console.log(`   Total players linked: ${totalLinked}`);
  console.log(`   Total players created: ${totalCreated}\n`);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalTeams: teams.length,
        totalPlayersLinked: totalLinked,
        totalPlayersCreated: totalCreated,
        teams: processedTeams
      },
      `All players linked successfully for ${teams.length} teams`
    )
  );
});