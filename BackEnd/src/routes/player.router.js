import express from "express";
import {
  getAllPlayers,
  getPlayerById,
} from "../controllers/player.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all players (e.g., for a search page)
router.route("/").get(getAllPlayers);

// Get a single player's profile by their ID
router.route("/:id").get(getPlayerById);

export default router;