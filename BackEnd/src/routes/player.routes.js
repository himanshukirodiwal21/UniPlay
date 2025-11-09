import express from "express";
import {
  getAllPlayers,
  getPlayerById,
  fixPlayerStats,
} from "../controllers/player.controller.js";

const router = express.Router();

// Fix player stats - CALL THIS FIRST to fix existing players
router.route("/fix-stats").get(fixPlayerStats);

// Get all players
router.route("/").get(getAllPlayers);

// Get a single player's profile by their ID
router.route("/:id").get(getPlayerById);

export default router;