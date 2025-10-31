import Match from "../models/match.model.js";
import { Event } from "../models/event.models.js";

/* -------------------------------------------------------
   ⚙️ Utility: Generate Round Robin Schedule
-------------------------------------------------------- */
function generateRoundRobinSchedule(teams) {
  const schedule = [];
  let teamList = [...teams];

  // If odd number of teams, add a "bye" (null)
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
   🏆 Generate Knockout Matches (Semi Finals + Final)
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

    // Final (TBD teams - will be updated after semifinals)
    const finalDate = new Date(baseDate);
    finalDate.setDate(baseDate.getDate() + Math.floor(matchCount / 3) + 5);
    finalDate.setHours(16, 0, 0, 0);
    
    knockoutMatches.push({
      teamA: null, // Winner of Semi 1
      teamB: null, // Winner of Semi 2
      stage: "Final",
      round: 1,
      scheduledTime: finalDate,
      venue: "Championship Ground",
    });
  }

  return knockoutMatches;
}

/* -------------------------------------------------------
   🏏 Generate Complete Schedule for an Event
   (Round Robin + Knockout Stages)
-------------------------------------------------------- */
export const generateEventSchedule = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event)
      return res.status(404).json({ msg: "Event not found" });

    if (event.scheduleGenerated)
      return res.status(400).json({ msg: "Schedule already generated for this event" });

    const teamIds = event.registeredTeams;
    if (!teamIds || teamIds.length < 2)
      return res.status(400).json({ msg: "Not enough teams registered (minimum 2 required)" });

    console.log(`\n🏏 Generating tournament for ${teamIds.length} teams...`);

    // Step 1: Generate Round Robin Matches
    const roundRobinMatches = generateRoundRobinSchedule(teamIds);
    console.log(`✅ Round Robin: ${roundRobinMatches.length} matches`);

    // Create realistic scheduled times for Round Robin
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 1); // Start from tomorrow
    baseDate.setHours(9, 0, 0, 0); // Start at 9 AM

    const matchesToCreate = roundRobinMatches.map((m, index) => {
      const scheduleDate = new Date(baseDate);
      
      // Schedule 3 matches per day (9 AM, 2 PM, 6 PM)
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

    // Step 2: Generate Knockout Stage (if 4+ teams)
    let knockoutMatches = [];
    if (teamIds.length >= 4) {
      // Take top 4 teams (initially just first 4, will be updated based on points later)
      const topTeams = teamIds.slice(0, 4);
      knockoutMatches = generateKnockoutMatches(topTeams, baseDate, matchesToCreate.length);
      
      const knockoutMatchesToCreate = knockoutMatches.map(m => ({
        ...m,
        event: eventId,
        status: "Scheduled",
      }));

      matchesToCreate.push(...knockoutMatchesToCreate);
      console.log(`✅ Knockout Stage: ${knockoutMatches.length} matches (2 Semifinals + 1 Final)`);
    }

    // Step 3: Insert all matches into database
    const createdMatches = await Match.insertMany(matchesToCreate);
    console.log(`✅ Total ${createdMatches.length} matches created in database`);

    // Step 4: Initialize leaderboard
    event.leaderboard = teamIds.map((t) => ({ 
      team: t, 
      points: 0,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0
    }));
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
      },
      matches: createdMatches,
    });

  } catch (err) {
    console.error("❌ Error generating schedule:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while generating schedule",
      error: err.message 
    });
  }
};

/* -------------------------------------------------------
   📋 Get All Matches (with optional filters)
-------------------------------------------------------- */
export const getMatches = async (req, res) => {
  try {
    const { status, event } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (event) filter.event = event;

    const matches = await Match.find(filter)
      .populate("teamA", "name")
      .populate("teamB", "name")
      .populate("winner", "name")
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
      .populate("teamA", "name")
      .populate("teamB", "name")
      .populate("winner", "name")
      .populate("event", "name");

    if (!match)
      return res.status(404).json({ message: "Match not found" });

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (err) {
    console.error("❌ Error fetching match by ID:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

/* -------------------------------------------------------
   🕹️ Update Match Status / Score
-------------------------------------------------------- */
export const updateMatch = async (req, res) => {
  try {
    const { status, scoreA, scoreB, winner } = req.body;

    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { status, scoreA, scoreB, winner },
      { new: true }
    )
      .populate("teamA", "name")
      .populate("teamB", "name")
      .populate("winner", "name")
      .populate("event", "name");

    if (!match)
      return res.status(404).json({ 
        success: false,
        message: "Match not found" 
      });

    // Update leaderboard if match is completed
    if (status === "Completed" && winner && match.stage === "RoundRobin") {
      const event = await Event.findById(match.event);
      
      if (event && event.leaderboard) {
        // Update winner's points
        const winnerEntry = event.leaderboard.find(
          entry => entry.team.toString() === winner.toString()
        );
        if (winnerEntry) {
          winnerEntry.points += 2;
          winnerEntry.wins += 1;
          winnerEntry.matchesPlayed += 1;
        }

        // Update loser's stats
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

        // Sort leaderboard by points
        event.leaderboard.sort((a, b) => b.points - a.points);
        await event.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "✅ Match updated successfully",
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
   🏆 Get Leaderboard for an Event
-------------------------------------------------------- */
export const getEventLeaderboard = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId)
      .populate("leaderboard.team", "name");

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