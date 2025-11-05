import { Player } from "../models/player.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// @desc    Get all players
// @route   GET /api/v1/players
// @access  Public
export const getAllPlayers = asyncHandler(async (req, res) => {
  // TODO: Add pagination
  const players = await Player.find({}).select("-battingStats -bowlingStats"); // Exclude detailed stats

  if (!players) {
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

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Player ID");
  }

  // Find player and populate their team history
  const player = await Player.findById(id).populate("teams", "teamName eventId");

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  // TODO: Add aggregation to calculate batting/bowling averages
  // For now, we return the raw stats

  return res
    .status(200)
    .json(new ApiResponse(200, player, "Player profile fetched successfully"));
});