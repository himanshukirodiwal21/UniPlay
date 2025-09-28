import { Router } from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  getPendingEvents,
  approveEvent,
  declineEvent,
} from "../controllers/event.controller.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = Router();

// Public routes
router.post("/requestEvent", createEvent);
router.get("/events", getEvents);
router.get("/events/:id", getEventById);

// Admin-only routes
router.get("/requests", isAdmin, getPendingEvents);
router.put("/requests/:id/approve", isAdmin, approveEvent);
router.put("/requests/:id/decline", isAdmin, declineEvent);

export default router;
