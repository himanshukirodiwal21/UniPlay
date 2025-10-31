import Match from "../models/match.model.js";
import { Event } from "../models/event.models.js";
import TeamRegistration from "../models/teamRegistration.model.js";

/* -------------------------------------------------------
   ⚙️ Utility: Generate Round Robin Schedule
-------------------------------------------------------- */
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

/* -------------------------------------------------------
   🏆 Generate Knockout Matches (Only Semifinals)
-------------------------------------------------------- */
function generateKnockoutMatches(topTeams, baseDate, matchCount) {
  const knockoutMatches = [];

  if (topTeams.length >= 4) {
    // Semi Final 1: 1st vs 4th
    const semi1Date = new Date(baseDate);
    semi1Date.setDate(baseDate.getDate() + Math.floor(matchCount / 3) + 2);
    semi1Date.setHours(14, 0, 0, 0);
    
    knockoutMatches.push({
      teamA: topTeams[0],
      teamB: topTeams[3],
      stage: "Semifinal",
      round: 1,
      scheduledTime: semi1Date,
      venue: "Main Ground",
    });

    // Semi Final 2: 2nd vs 3rd
    const semi2Date = new Date(baseDate);
    semi2Date.setDate(baseDate.getDate() + Math.floor(matchCount / 3) + 2);
    semi2Date.setHours(18, 0, 0, 0);
    
    knockoutMatches.push({
      teamA: topTeams[1],
      teamB: topTeams[2],
      stage: "Semifinal",
      round: 2,
      scheduledTime: semi2Date,
      venue: "Ground 2",
    });

    // Note: Final will be created after semifinals complete
  }

  return knockoutMatches;
}

/* -------------------------------------------------------
   🏏 Generate Complete Schedule
-------------------------------------------------------- */
export const generateEventSchedule = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    console.log(`\n🔍 Generating schedule for event: ${eventId}`);
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ 
        success: false,
        msg: "Event not found" 
      });
    }

    if (event.scheduleGenerated) {
      return res.status(400).json({ 
        success: false,
        msg: "Schedule already generated for this event" 
      });
    }

    // ✅ Find teams with 'eventId' field
    console.log(`🔍 Fetching registered teams for event: ${eventId}`);
    let registeredTeams = await TeamRegistration.find({ eventId: eventId });
    console.log(`📊 Method 1 (with eventId filter): ${registeredTeams.length} teams`);

    // Fallback: Try 'event' field
    if (registeredTeams.length === 0) {
      registeredTeams = await TeamRegistration.find({ event: eventId });
      console.log(`📊 Method 2 (with event filter): ${registeredTeams.length} teams`);
    }

    // Fallback: Get all teams
    if (registeredTeams.length === 0) {
      console.log("⚠️ No teams found with filters, fetching all teams...");
      registeredTeams = await TeamRegistration.find({});
      console.log(`📊 Method 3 (all teams): ${registeredTeams.length} teams`);
    }

    if (registeredTeams.length < 2) {
      return res.status(400).json({ 
        success: false,
        msg: `Not enough teams registered (Found: ${registeredTeams.length}, Required: minimum 2)`
      });
    }

    console.log(`✅ Using ${registeredTeams.length} teams for schedule generation`);

    const teamIds = registeredTeams.map(registration => registration._id);

    // Step 1: Generate Round Robin Matches
    const roundRobinMatches = generateRoundRobinSchedule(teamIds);
    console.log(`✅ Round Robin: ${roundRobinMatches.length} matches`);

    // Create scheduled times
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 1);
    baseDate.setHours(9, 0, 0, 0);

    const matchesToCreate = roundRobinMatches.map((m, index) => {
      const scheduleDate = new Date(baseDate);
      const matchesPerDay = 3;
      const dayOffset = Math.floor(index / matchesPerDay);
      const matchOfDay = index % matchesPerDay;
      
      scheduleDate.setDate(baseDate.getDate() + dayOffset);
      
      if (matchOfDay === 0) {
        scheduleDate.setHours(9, 0, 0, 0);
      } else if (matchOfDay === 1) {
        scheduleDate.setHours(14, 0, 0, 0);
      } else {
        scheduleDate.setHours(18, 0, 0, 0);
      }

      return {
        ...m,
        event: eventId,
        status: "Scheduled",
        scheduledTime: scheduleDate,
        venue: `Ground ${(index % 3) + 1}`,
      };
    });

    // Step 2: Generate Knockout Stage (Only Semifinals)
    let knockoutMatches = [];
    if (teamIds.length >= 4) {
      const topTeams = teamIds.slice(0, 4);
      knockoutMatches = generateKnockoutMatches(topTeams, baseDate, matchesToCreate.length);
      
      const knockoutMatchesToCreate = knockoutMatches.map(m => ({
        ...m,
        event: eventId,
        status: "Scheduled",
      }));

      matchesToCreate.push(...knockoutMatchesToCreate);
      console.log(`✅ Knockout: ${knockoutMatches.length} matches (Semifinals only)`);
    }

    // Step 3: Insert matches
    const createdMatches = await Match.insertMany(matchesToCreate);
    console.log(`✅ ${createdMatches.length} matches created`);

    // Step 4: Initialize leaderboard
    event.leaderboard = teamIds.map((t) => ({ 
      team: t, 
      points: 0,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0
    }));
    
    event.registeredTeams = teamIds;
    event.scheduleGenerated = true;
    await event.save();

    console.log(`✅ Tournament schedule generation completed!\n`);

    res.status(201).json({
      success: true,
      message: `✅ Tournament schedule generated successfully!`,
      summary: {
        totalMatches: createdMatches.length,
        roundRobinMatches: roundRobinMatches.length,
        knockoutMatches: knockoutMatches.length,
        teams: teamIds.length,
        startDate: baseDate.toLocaleDateString('en-IN'),
        note: "Final match will be created after semifinals complete"
      },
      matches: createdMatches,
    });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

/* -------------------------------------------------------
   📋 Get All Matches
-------------------------------------------------------- */
export const getMatches = async (req, res) => {
  try {
    const { status, event } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (event) filter.event = event;

    const matches = await Match.find(filter)
      .populate({
        path: "teamA",
        select: "teamName captainName"
      })
      .populate({
        path: "teamB", 
        select: "teamName captainName"
      })
      .populate({
        path: "winner",
        select: "teamName"
      })
      .populate("event", "name")
      .sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      total: matches.length,
      data: matches
    });
  } catch (err) {
    console.error("❌ Error fetching matches:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------------------------------------------
   📄 Get Single Match by ID
-------------------------------------------------------- */
export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("teamA", "teamName captainName")
      .populate("teamB", "teamName captainName")
      .populate("winner", "teamName")
      .populate("event", "name");

    if (!match)
      return res.status(404).json({ message: "Match not found" });

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (err) {
    console.error("❌ Error fetching match:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

/* -------------------------------------------------------
   🕹️ Update Match
-------------------------------------------------------- */
export const updateMatch = async (req, res) => {
  try {
    const { status, scoreA, scoreB, winner } = req.body;

    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { status, scoreA, scoreB, winner },
      { new: true }
    )
      .populate("teamA", "teamName")
      .populate("teamB", "teamName")
      .populate("winner", "teamName")
      .populate("event", "name");

    if (!match)
      return res.status(404).json({ 
        success: false,
        message: "Match not found" 
      });

    if (status === "Completed" && winner && match.stage === "RoundRobin") {
      const event = await Event.findById(match.event);
      
      if (event && event.leaderboard) {
        const winnerEntry = event.leaderboard.find(
          entry => entry.team.toString() === winner.toString()
        );
        if (winnerEntry) {
          winnerEntry.points += 2;
          winnerEntry.wins += 1;
          winnerEntry.matchesPlayed += 1;
        }

        const loserId = winner.toString() === match.teamA._id.toString() 
          ? match.teamB._id 
          : match.teamA._id;
        
        const loserEntry = event.leaderboard.find(
          entry => entry.team.toString() === loserId.toString()
        );
        if (loserEntry) {
          loserEntry.losses += 1;
          loserEntry.matchesPlayed += 1;
        }

        event.leaderboard.sort((a, b) => b.points - a.points);
        await event.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "✅ Match updated",
      data: match,
    });
  } catch (err) {
    console.error("❌ Error updating match:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

/* -------------------------------------------------------
   🏆 Get Leaderboard
-------------------------------------------------------- */
export const getEventLeaderboard = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId)
      .populate("leaderboard.team", "teamName");

    if (!event)
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });

    res.status(200).json({
      success: true,
      data: event.leaderboard || []
    });
  } catch (err) {
    console.error("❌ Error fetching leaderboard:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};