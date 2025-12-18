import express from "express";
import {
  registerTeam,
  getTeamsByEvent,
  getMyRegistrations,
  getTeamRegistrationById,
  updateTeamRegistration,
  deleteTeamRegistration,
  updateRegistrationStatus,
  getAllTeams
} from "../controllers/teamRegistration.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = express.Router();

// ✅ THIS IS THE CORRECTED PART
// This now handles both POST and GET on the root "/" route
router.route("/")
  .post(registerTeam)
  .get(getAllTeams);

// --- All other routes remain the same ---

router.get("/event/:eventId", getTeamsByEvent);

router.get("/:id", getTeamRegistrationById);

router.get("/my-registrations", verifyJWT, getMyRegistrations);
router.put("/:id", verifyJWT, updateTeamRegistration);

// Delete team registration (team owner only)
router.delete("/:id", verifyJWT, deleteTeamRegistration);

// Update registration status (approve/reject)
router.patch("/:id/status", verifyJWT, isAdmin, updateRegistrationStatus);

export default router;