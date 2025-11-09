import { Player } from "../models/player.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

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