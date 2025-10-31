import express from "express";
import Match from "../models/match.model.js";
import TeamRegistration from "../models/teamRegistration.model.js";
import { generateEventSchedule } from "../controllers/match.controller.js";

const router = express.Router();

// 🧪 Test route to verify API connection
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ Match routes are working perfectly!",
    time: new Date().toLocaleString(),
  });
});

// 🔍 DEBUG ROUTE: Check registered teams for an event
router.get("/debug/teams/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    
    console.log("\n🔍 DEBUG: Checking teams for event:", eventId);
    
    // Method 1: Try with 'eventId' field
    const teams1 = await TeamRegistration.find({ eventId: eventId });
    console.log("✅ Method 1 (eventId field):", teams1.length, "teams found");
    
    // Method 2: Try with 'event' field
    const teams2 = await TeamRegistration.find({ event: eventId });
    console.log("✅ Method 2 (event field):", teams2.length, "teams found");
    
    // Method 3: Try finding all teams
    const allTeams = await TeamRegistration.find({});
    console.log("✅ Total teams in DB:", allTeams.length);
    
    // Check field structure
    if (allTeams.length > 0) {
      console.log("✅ Sample team structure:", {
        _id: allTeams[0]._id,
        teamName: allTeams[0].teamName,
        eventId: allTeams[0].eventId,
        event: allTeams[0].event,
        hasEventIdField: !!allTeams[0].eventId,
        hasEventField: !!allTeams[0].event
      });
    }
    
    // Use the correct field
    const correctTeams = teams1.length > 0 ? teams1 : teams2;
    
    res.json({
      success: true,
      eventId,
      results: {
        teamsWithEventIdField: teams1.length,
        teamsWithEventField: teams2.length,
        totalTeamsInDB: allTeams.length,
        sampleTeam: allTeams[0] || null
      },
      teams: correctTeams
    });
    
  } catch (err) {
    console.error("❌ Debug error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// 📊 GET ALL EVENTS - to find your event ID
router.get("/debug/events", async (req, res) => {
  try {
    const { Event } = await import("../models/event.models.js");
    const events = await Event.find({}).select("name _id scheduleGenerated registeredTeams");
    
    console.log("\n📊 All Events:");
    events.forEach(e => {
      console.log(`- ${e.name} (ID: ${e._id})`);
      console.log(`  Schedule Generated: ${e.scheduleGenerated}`);
      console.log(`  Registered Teams: ${e.registeredTeams?.length || 0}`);
    });
    
    res.json({
      success: true,
      total: events.length,
      events: events
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔧 FIX ROUTE: Link all teams to an event
router.post("/fix-teams/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    
    console.log("\n🔧 Linking teams to event:", eventId);
    
    // Check if event exists
    const { Event } = await import("../models/event.models.js");
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    
    // Find all teams without event field or with null event
    const teamsToUpdate = await TeamRegistration.find({
      $or: [
        { event: null },
        { event: { $exists: false } }
      ]
    });
    
    console.log(`Found ${teamsToUpdate.length} teams to link`);
    
    // Update teams
    const result = await TeamRegistration.updateMany(
      {
        $or: [
          { event: null },
          { event: { $exists: false } }
        ]
      },
      { $set: { event: eventId } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} teams`);
    
    res.json({
      success: true,
      message: `✅ Successfully linked ${result.modifiedCount} teams to event "${event.name}"`,
      result: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        eventName: event.name
      }
    });
    
  } catch (err) {
    console.error("❌ Fix error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// ✅ GET /api/v1/matches (optionally filter by status)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const matches = await Match.find(filter)
      .populate({
        path: "teamA",
        model: "TeamRegistration",
        select: "teamName captainName"
      })
      .populate({
        path: "teamB",
        model: "TeamRegistration",
        select: "teamName captainName"
      })
      .populate({
        path: "event",
        select: "name"
      })
      .sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      total: matches.length,
      data: matches,
    });
  } catch (err) {
    console.error("❌ Error fetching matches:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🏏 Generate round-robin schedule for an event
router.post("/:id/generateSchedule", generateEventSchedule);

export default router;