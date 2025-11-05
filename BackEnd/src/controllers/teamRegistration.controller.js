import TeamRegistration from "../models/teamRegistration.model.js";
import { Event } from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Register a new team
// @route   POST /api/v1/team-registrations
// @access  Public (No authentication required)
export const registerTeam = asyncHandler(async (req, res) => {
  const {
    eventId,
    teamName,
    captainName,
    captainEmail,
    captainPhone,
    captainCollege,
    players
  } = req.body;

  console.log("📥 Received registration request:", {
    eventId,
    teamName,
    captainName,
    playersCount: players?.length
  });

  // Validation
  if (!eventId || !teamName || !captainName || !captainEmail || !captainPhone || !captainCollege) {
    throw new ApiError(400, "All captain and team details are required");
  }

  if (!players || players.length !== 15) {
    throw new ApiError(400, "Team must have exactly 15 players");
  }

  // Check if event exists and is approved
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.status !== "approved") {
    throw new ApiError(400, "Cannot register for this event. Event is not approved.");
  }

  // Create team registration WITHOUT userId (no authentication required)
  const teamRegistration = await TeamRegistration.create({
    eventId,
    teamName,
    captainName,
    captainEmail,
    captainPhone,
    captainCollege,
    players
  });

  console.log("✅ Team registered successfully:", teamRegistration._id);

  res.status(201).json(
    new ApiResponse(201, teamRegistration, "Team registered successfully")
  );
});

// @desc    Get all team registrations for a specific event
// @route   GET /api/v1/team-registrations/event/:eventId
// @access  Public
export const getTeamsByEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const teams = await TeamRegistration.find({ eventId })
    .populate('userId', 'name email')
    .populate('eventId', 'name date location')
    .sort({ registrationDate: -1 });

  res.status(200).json(
    new ApiResponse(200, teams, "Teams fetched successfully")
  );
});

// @desc    Get all registrations by logged-in user
// @route   GET /api/v1/team-registrations/my-registrations
// @access  Private
export const getMyRegistrations = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const registrations = await TeamRegistration.find({ userId })
    .populate('eventId', 'name date location image')
    .sort({ registrationDate: -1 });

  res.status(200).json(
    new ApiResponse(200, registrations, "Your registrations fetched successfully")
  );
});

// @desc    Get single team registration details
// @route   GET /api/v1/team-registrations/:id
// @access  Public
export const getTeamRegistrationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const registration = await TeamRegistration.findById(id)
    .populate('userId', 'name email')
    .populate('eventId', 'name date location');

  if (!registration) {
    throw new ApiError(404, "Team registration not found");
  }

  res.status(200).json(
    new ApiResponse(200, registration, "Team registration details fetched")
  );
});

// @desc    Update team registration (before approval)
// @route   PUT /api/v1/team-registrations/:id
// @access  Private (only team owner)
export const updateTeamRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;

  const registration = await TeamRegistration.findById(id);

  if (!registration) {
    throw new ApiError(404, "Team registration not found");
  }

  // Check if user owns this registration
  if (registration.userId && registration.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this registration");
  }

  // Prevent updates if already approved
  if (registration.registrationStatus === 'approved') {
    throw new ApiError(400, "Cannot update approved registration");
  }

  const updatedRegistration = await TeamRegistration.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    new ApiResponse(200, updatedRegistration, "Team registration updated successfully")
  );
});

// @desc    Delete team registration
// @route   DELETE /api/v1/team-registrations/:id
// @access  Private (only team owner)
export const deleteTeamRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;

  const registration = await TeamRegistration.findById(id);

  if (!registration) {
    throw new ApiError(404, "Team registration not found");
  }

  // Check ownership (if userId exists)
  if (registration.userId && registration.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this registration");
  }

  await TeamRegistration.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, null, "Team registration deleted successfully")
  );
});

// @desc    Update registration status (Admin only)
// @route   PATCH /api/v1/team-registrations/:id/status
// @access  Private/Admin
export const updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const registration = await TeamRegistration.findByIdAndUpdate(
    id,
    { registrationStatus: status },
    { new: true }
  );

  if (!registration) {
    throw new ApiError(404, "Team registration not found");
  }

  res.status(200).json(
    new ApiResponse(200, registration, `Registration ${status} successfully`)
  );
});

// @desc    Get all team registrations
// @route   GET /api/v1/team-registrations
// @access  Public
export const getAllTeams = asyncHandler(async (req, res) => {
  const teams = await TeamRegistration.find({})
    .populate('eventId', 'name') // Optional: get event name
    .sort({ registrationDate: -1 });

  if (!teams) {
    throw new ApiError(404, "No teams found");
  }

  res.status(200).json(
    new ApiResponse(200, teams, "All teams fetched successfully")
  );
});