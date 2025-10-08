import express from "express";
import {
  registerTeam,
  getTeamsByEvent,
  getMyRegistrations,
  getTeamRegistrationById,
  updateTeamRegistration,
  deleteTeamRegistration,
  updateRegistrationStatus
} from "../controllers/teamregistration.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = express.Router();

router.post("/", registerTeam);

router.get("/event/:eventId", getTeamsByEvent);

router.get("/:id", getTeamRegistrationById);

router.get("/my-registrations", verifyJWT, getMyRegistrations);
router.put("/:id", verifyJWT, updateTeamRegistration);

// Delete team registration (team owner only)
router.delete("/:id", verifyJWT, deleteTeamRegistration);


// Update registration status (approve/reject)
router.patch("/:id/status", verifyJWT, isAdmin, updateRegistrationStatus);

export default router;