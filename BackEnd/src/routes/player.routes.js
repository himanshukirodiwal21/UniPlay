// src/routes/player.routes.js
import express from "express";
import {
  getAllPlayers,
  getPlayerById,
  fixPlayerStats,
  linkTeamPlayerToPlayer,
  autoLinkTeamPlayers,
  linkTeamPlayers,      // ✅ NEW - Link single team
  linkEventPlayers,     // ✅ NEW - Link all teams in event
} from "../controllers/player.controller.js";

const router = express.Router();

// Fix player stats - CALL THIS FIRST to fix existing players
router.route("/fix-stats").get(fixPlayerStats);

// ✅ NEW ROUTES - Link players to Player collection
router.route("/link-team/:teamId").post(linkTeamPlayers);           // Link single team
router.route("/link-event/:eventId").post(linkEventPlayers);        // Link all teams in event

// ✅ EXISTING ROUTES - Individual player linking
router.route("/teams/:teamId/players/:teamPlayerId/link").post(linkTeamPlayerToPlayer);
router.route("/teams/:teamId/link-all-players").post(autoLinkTeamPlayers);

// Get all players
router.route("/").get(getAllPlayers);

// Get a single player's profile by their ID
router.route("/:id").get(getPlayerById);

export default router;