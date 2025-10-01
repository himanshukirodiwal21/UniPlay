import { Router } from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  getPendingEvents,
  approveEvent,
  declineEvent,
  deleteEvent,  // ✅ Import add karo
} from "../controllers/event.controller.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = Router();

// Public routes
router.post("/requestEvent", createEvent);
router.get("/events", getEvents);
router.get("/events/:id", getEventById);

// Admin-only routes
router.get("/requests",  getPendingEvents);
router.put("/requests/:id/approve",  approveEvent);
router.put("/requests/:id/decline",  declineEvent);
router.delete("/requests/:id",  deleteEvent);  // ✅ Ye line add karo

export default router;