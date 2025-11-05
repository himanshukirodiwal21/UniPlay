import express from "express";
import Match from "../models/match.model.js";
import TeamRegistration from "../models/teamRegistration.model.js";
import { 
  generateEventSchedule,
  getMatches,
  getMatchById,
  updateMatch,
  getEventLeaderboard,
  resetEventSchedule
} from "../controllers/match.controller.js";

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
    const { Event } = await import("../models/event.model.js");
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
    const { Event } = await import("../models/event.model.js");
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

// ✅ GET /api/v1/matches (with auto live detection)
router.get("/", getMatches);

// 📄 GET single match by ID
router.get("/:id", getMatchById);

// 🕹️ UPDATE match (scores, status, winner)
router.put("/:id", updateMatch);

// 🏆 GET leaderboard for an event
router.get("/events/:id/leaderboard", getEventLeaderboard);

// 🏏 Generate round-robin schedule for an event
router.post("/:id/generateSchedule", generateEventSchedule);

// 🔄 Reset event schedule (for development)
router.delete("/events/:id/reset-schedule", resetEventSchedule);

// 🎮 MANUAL: Start a match (change status to InProgress)
router.post("/:id/start", async (req, res) => {
  try {
    const matchId = req.params.id;
    
    const match = await Match.findByIdAndUpdate(
      matchId,
      { status: "InProgress" },
      { new: true }
    )
      .populate("teamA", "teamName")
      .populate("teamB", "teamName");

    if (!match) {
      return res.status(404).json({ 
        success: false, 
        message: "Match not found" 
      });
    }

    console.log(`🔴 Match started: ${match.teamA.teamName} vs ${match.teamB.teamName}`);

    res.json({
      success: true,
      message: "Match started successfully",
      match
    });
  } catch (err) {
    console.error("❌ Error starting match:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// 🔄 UTILITY: Update all past scheduled matches to InProgress
router.post("/update-status", async (req, res) => {
  try {
    const now = new Date();
    console.log(`\n🔄 Checking for past matches...`);
    console.log(`Current time: ${now.toLocaleString('en-IN')}`);

    const pastMatches = await Match.find({
      status: "Scheduled",
      scheduledTime: { $lte: now }
    }).populate("teamA teamB", "teamName");

    console.log(`Found ${pastMatches.length} past scheduled matches`);

    if (pastMatches.length > 0) {
      pastMatches.forEach(m => {
        console.log(`  - ${m.teamA?.teamName} vs ${m.teamB?.teamName} (${new Date(m.scheduledTime).toLocaleString('en-IN')})`);
      });

      const result = await Match.updateMany(
        {
          status: "Scheduled",
          scheduledTime: { $lte: now }
        },
        {
          $set: { status: "InProgress" }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} matches to InProgress\n`);

      res.json({
        success: true,
        message: `Updated ${result.modifiedCount} matches to InProgress`,
        matchesUpdated: result.modifiedCount,
        matches: pastMatches
      });
    } else {
      res.json({
        success: true,
        message: "No matches to update",
        matchesUpdated: 0
      });
    }
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// 🏁 UTILITY: Auto-complete old live matches
router.post("/complete-old-matches", async (req, res) => {
  try {
    const now = new Date();
    const threeHoursAgo = new Date(now - 3 * 60 * 60 * 1000);
    
    console.log(`\n🏁 Checking for matches to complete...`);
    console.log(`Current time: ${now.toLocaleString('en-IN')}`);
    console.log(`Cutoff time: ${threeHoursAgo.toLocaleString('en-IN')}`);

    // Find matches that should be completed
    const oldMatches = await Match.find({
      status: { $in: ["Scheduled", "InProgress"] },
      scheduledTime: { $lt: threeHoursAgo }
    }).populate("teamA teamB", "teamName");

    console.log(`Found ${oldMatches.length} old matches to complete`);

    if (oldMatches.length > 0) {
      // Complete each match with random scores
      for (const match of oldMatches) {
        const scoreA = Math.floor(Math.random() * 100) + 100; // 100-200
        const scoreB = Math.floor(Math.random() * 100) + 100;
        const winner = scoreA > scoreB ? match.teamA._id : match.teamB._id;

        await Match.updateOne(
          { _id: match._id },
          {
            $set: {
              status: "Completed",
              scoreA: scoreA,
              scoreB: scoreB,
              winner: winner
            }
          }
        );

        console.log(`  ✅ Completed: ${match.teamA?.teamName} ${scoreA} - ${scoreB} ${match.teamB?.teamName}`);
      }

      res.json({
        success: true,
        message: `✅ Completed ${oldMatches.length} old matches`,
        matchesCompleted: oldMatches.length,
        matches: oldMatches
      });
    } else {
      res.json({
        success: true,
        message: "No old matches to complete",
        matchesCompleted: 0
      });
    }
  } catch (err) {
    console.error("❌ Error completing matches:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Add these debug routes to your match.routes.js or create a separate debug.routes.js

/* -------------------------------------------------------
   🔍 DEBUG: Check Event Structure
-------------------------------------------------------- */
router.get("/debug/event/:id", async (req, res) => {
  try {
    const { Event } = await import("../models/event.model.js");
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      event: {
        _id: event._id,
        name: event.name,
        hasLeaderboard: !!event.leaderboard,
        leaderboardLength: event.leaderboard?.length || 0,
        scheduleGenerated: event.scheduleGenerated,
        registeredTeamsCount: event.registeredTeams?.length || 0,
        leaderboardSample: event.leaderboard?.[0] || null,
        fullLeaderboard: event.leaderboard
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
});

/* -------------------------------------------------------
   🔍 DEBUG: Check Teams for Event
-------------------------------------------------------- */
router.get("/debug/event/:id/teams", async (req, res) => {
  try {
    const TeamRegistration = (await import("../models/teamRegistration.model.js")).default;
    
    const teams = await TeamRegistration.find({ 
      $or: [
        { event: req.params.id },
        { eventId: req.params.id }
      ]
    });

    res.json({
      success: true,
      count: teams.length,
      teams: teams.map(t => ({
        _id: t._id,
        teamName: t.teamName,
        event: t.event,
        eventId: t.eventId
      }))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* -------------------------------------------------------
   🔍 DEBUG: Full Leaderboard Test
-------------------------------------------------------- */
router.get("/debug/leaderboard/:eventId", async (req, res) => {
  try {
    const { Event } = await import("../models/event.model.js");
    const TeamRegistration = (await import("../models/teamRegistration.model.js")).default;
    
    console.log("\n🔍 DEBUG LEADERBOARD CHECK");
    console.log("Event ID:", req.params.eventId);
    
    // Step 1: Find event
    const event = await Event.findById(req.params.eventId);
    console.log("✅ Event found:", event?.name);
    console.log("📊 Raw leaderboard:", JSON.stringify(event?.leaderboard, null, 2));
    
    // Step 2: Try to populate
    const populatedEvent = await Event.findById(req.params.eventId)
      .populate("leaderboard.team");
    
    console.log("📊 Populated leaderboard:", JSON.stringify(populatedEvent?.leaderboard, null, 2));
    
    // Step 3: Check if team IDs are valid
    if (event?.leaderboard && event.leaderboard.length > 0) {
      const teamId = event.leaderboard[0].team;
      console.log("🔍 Checking first team ID:", teamId);
      
      const team = await TeamRegistration.findById(teamId);
      console.log("✅ Team found:", team?.teamName || "NOT FOUND");
    }
    
    res.json({
      success: true,
      debug: {
        eventFound: !!event,
        eventName: event?.name,
        leaderboardLength: event?.leaderboard?.length || 0,
        rawLeaderboard: event?.leaderboard,
        populatedLeaderboard: populatedEvent?.leaderboard,
        firstTeamId: event?.leaderboard?.[0]?.team,
      }
    });
  } catch (err) {
    console.error("❌ Debug error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
});

export default router;