import { Router } from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  getPendingEvents,
  approveEvent,
  declineEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
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

// ===================== ADMIN ROUTES ===================== //

// 📋 Get all event requests (pending, approved, rejected)
router.get("/requests", isAdmin, getPendingEvents);

// ✅ Approve event request
router.put("/requests/:id/approve", isAdmin, approveEvent);

// ❌ Decline event request
router.put("/requests/:id/decline", isAdmin, declineEvent);

// 🗑️ Delete an event and its matches
router.delete("/requests/:id", isAdmin, deleteEvent);

export default router;
