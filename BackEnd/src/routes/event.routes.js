// src/routes/event.routes.js
import { Router } from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  getPendingEvents,
  approveEvent,
  declineEvent,
  deleteEvent
  // ❌ REMOVED getEventLeaderboard from here - it doesn't exist in event.controller.js
} from "../controllers/event.controller.js";

// ✅ Import getEventLeaderboard from match.controller.js instead
import { getEventLeaderboard } from "../controllers/match.controller.js";

import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = Router();

// 🧪 Test route (optional, just to confirm event routes work)
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ Event routes are connected successfully!",
    time: new Date().toLocaleString(),
  });
});

// ===================== PUBLIC ROUTES ===================== //

// 📩 User requests a new event
router.post("/requestEvent", createEvent);

// 📜 Get all approved events (for home or users)
router.get("/events", getEvents);

// 🔍 Get single event details
router.get("/events/:id", getEventById);

// 🏆 Leaderboard route - ✅ IMPORTED FROM match.controller.js
router.get("/events/:id/leaderboard", getEventLeaderboard);

// ===================== ADMIN ROUTES ===================== //

// 📋 Get all event requests (pending, approved, rejected)
router.get("/requests", getPendingEvents);

// ✅ Approve event request
router.put("/requests/:id/approve", approveEvent);

// ❌ Decline event request
router.put("/requests/:id/decline", declineEvent);

// 🗑️ Delete an event and its matches
router.delete("/requests/:id", deleteEvent);

export default router;