import express from "express";
import Match from "../models/match.model.js";

const router = express.Router();

// 🧪 Test route to verify API connection
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ Match routes are working perfectly!",
    time: new Date().toLocaleString(),
  });
});


// ✅ GET /api/v1/matches (optionally filter by status)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const matches = await Match.find(filter)
      .populate("teamA teamB event")
      .sort({ scheduledTime: 1 });

    res.status(200).json(matches);
  } catch (err) {
    console.error("Error fetching matches:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
