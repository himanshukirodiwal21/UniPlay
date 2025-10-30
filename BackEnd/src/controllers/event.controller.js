import { Event } from "../models/event.models.js";
import Match from "../models/match.model.js";
import Team from "../models/team.model.js";

// Create a new event
const createEvent = async (req, res) => {
  try {
    const {
      name,
      date,
      location,
      eligibility,
      image,
      registrationFee,
      winningPrize,
      description,
      status,
    } = req.body;

    if (!name || !date || !location || !eligibility) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const newEvent = new Event({
      name,
      date,
      location,
      eligibility,
      image: image || "",
      registrationFee: registrationFee || 0,
      winningPrize: winningPrize || "",
      description: description || "",
      status: status || "pending",
    });

    await newEvent.save();
    return res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Fetch only approved events (for HomePage)
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" }).sort({ date: 1 });
    return res.status(200).json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Fetch single event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.status(200).json(event);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Fetch all events (admin filtering by status)
const getPendingEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};
    const events = await Event.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Approve an event
const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const event = await Event.findByIdAndUpdate(
      id,
      {
        status: "approved",
        adminNotes: adminNotes || "",
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.status(200).json({ message: "Event approved", event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Reject an event
const declineEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const event = await Event.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        adminNotes: adminNotes || "",
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.status(200).json({ message: "Event rejected", event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Delete event + matches
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    await Match.deleteMany({ event: id });

    return res.status(200).json({
      message: "Event and associated matches deleted successfully",
      event: deletedEvent,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Round-robin schedule generator
function generateRoundRobinSchedule(teams) {
  const schedule = [];
  let teamList = [...teams];
  if (teamList.length % 2 !== 0) teamList.push(null);

  const numTeams = teamList.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  const fixedTeam = teamList[0];
  let rotatingTeams = teamList.slice(1);

  for (let round = 1; round <= numRounds; round++) {
    const opponent = rotatingTeams[rotatingTeams.length - 1];
    if (opponent !== null) {
      schedule.push({
        teamA: fixedTeam,
        teamB: opponent,
        stage: "RoundRobin",
        round,
      });
    }

    for (let i = 0; i < matchesPerRound - 1; i++) {
      const teamA = rotatingTeams[i];
      const teamB = rotatingTeams[rotatingTeams.length - 2 - i];
      if (teamA !== null && teamB !== null) {
        schedule.push({
          teamA,
          teamB,
          stage: "RoundRobin",
          round,
        });
      }
    }
    rotatingTeams.unshift(rotatingTeams.pop());
  }
  return schedule;
}

// Generate event schedule
const generateEventSchedule = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (event.scheduleGenerated)
      return res.status(400).json({ msg: "Schedule already generated" });

    const teamIds = event.registeredTeams;
    if (!teamIds || teamIds.length < 2)
      return res.status(400).json({ msg: "Not enough teams registered" });

    const matchups = generateRoundRobinSchedule(teamIds);
    const matchesToCreate = matchups.map((m) => ({ ...m, event: eventId }));

    await Match.insertMany(matchesToCreate);
    event.leaderboard = teamIds.map((t) => ({ team: t }));
    event.scheduleGenerated = true;
    await event.save();

    res.status(201).json({
      msg: `Generated ${matchesToCreate.length} round-robin matches.`,
      matches: matchesToCreate,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export {
  createEvent,
  getEvents,
  getEventById,
  getPendingEvents,
  approveEvent,
  declineEvent,
  deleteEvent,
  generateEventSchedule,
};
