// src/routes/liveMatch.routes.js
import express from "express";
import {
  initializeLiveMatch,
  updateBall,
  getLiveMatch,
  completeInnings,
  getCommentary,
  setCurrentPlayers
} from "../controllers/liveMatch.controller.js";

const router = express.Router();

// 🧪 Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ LiveMatch routes are working!",
    endpoints: {
      initialize: "POST /initialize",
      updateBall: "POST /:matchId/ball",
      getLive: "GET /:matchId",
      completeInnings: "POST /:matchId/complete-innings",
      commentary: "GET /:matchId/commentary",
      setPlayers: "POST /:matchId/players"
    }
  });
});

// 🎬 Initialize live match
router.post("/initialize", initializeLiveMatch);

// 📊 Get live match data
router.get("/:matchId", getLiveMatch);

// 🏏 Update ball (ball-by-ball scoring)
router.post("/:matchId/ball", updateBall);

// 🔄 Complete innings
router.post("/:matchId/complete-innings", completeInnings);

// 💬 Get commentary
router.get("/:matchId/commentary", getCommentary);

// 🎯 Set current batsmen and bowler
router.post("/:matchId/players", setCurrentPlayers);

export default router;