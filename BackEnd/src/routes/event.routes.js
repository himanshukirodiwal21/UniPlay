import { Router } from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  
} from "../controllers/event.controller.js";

const router = Router();

router.post("/requestEvent", createEvent);
router.get("/events", getEvents);
router.get("/events/:id", getEventById);

export default router;
