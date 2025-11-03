// src/controllers/liveMatch.controller.js
import LiveMatch from "../models/liveMatch.model.js";
import Match from "../models/match.model.js";

/* -------------------------------------------------------
   🎬 Initialize Live Match
-------------------------------------------------------- */
export const initializeLiveMatch = async (req, res) => {
  try {
    const { matchId, tossWinner, tossDecision } = req.body;

    // Validate match exists
    const match = await Match.findById(matchId)
      .populate('teamA teamB', 'teamName');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }

    // Check if live match already exists
    const existingLiveMatch = await LiveMatch.findOne({ match: matchId });
    if (existingLiveMatch) {
      return res.status(400).json({
        success: false,
        message: "Live match already initialized"
      });
    }

    // Determine batting/bowling teams based on toss
    const battingTeam = tossDecision === 'bat' ? tossWinner : 
                       (tossWinner.toString() === match.teamA._id.toString() ? match.teamB._id : match.teamA._id);
    const bowlingTeam = tossDecision === 'bowl' ? tossWinner :
                       (tossWinner.toString() === match.teamA._id.toString() ? match.teamB._id : match.teamA._id);

    // Create live match
    const liveMatch = await LiveMatch.create({
      match: matchId,
      teamA: match.teamA._id,
      teamB: match.teamB._id,
      tossWinner,
      tossDecision,
      currentInnings: 1,
      innings: [
        {
          inningsNumber: 1,
          battingTeam,
          bowlingTeam,
          ballByBall: []
        }
      ],
      status: 'inProgress',
      totalOvers: match.stage === 'Final' ? 20 : 20 // Can be customized
    });

    // Update match status to InProgress
    await Match.findByIdAndUpdate(matchId, { status: 'InProgress' });

    console.log(`🎬 Live match initialized: ${match.teamA.teamName} vs ${match.teamB.teamName}`);

    res.status(201).json({
      success: true,
      message: "Live match initialized successfully",
      data: liveMatch
    });

  } catch (err) {
    console.error("❌ Error initializing live match:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

/* -------------------------------------------------------
   🏏 Update Ball (Ball-by-Ball)
-------------------------------------------------------- */
export const updateBall = async (req, res) => {
  try {
    const { matchId } = req.params;
    const {
      runs,
      extras,
      extrasType,
      isWicket,
      wicketType,
      dismissedPlayer,
      batsman,
      bowler,
      commentary
    } = req.body;

    const liveMatch = await LiveMatch.findOne({ match: matchId });

    if (!liveMatch) {
      return res.status(404).json({
        success: false,
        message: "Live match not found"
      });
    }

    const currentInnings = liveMatch.innings[liveMatch.currentInnings - 1];

    // Calculate ball number and over
    const totalBalls = currentInnings.balls + 1;
    const over = Math.floor(totalBalls / 6);
    const ballInOver = totalBalls % 6;

    // Create ball entry
    const ball = {
      ballNumber: totalBalls,
      over: `${over}.${ballInOver}`,
      batsman,
      bowler,
      runs: runs || 0,
      extras: extras || 0,
      extrasType: extrasType || 'none',
      isWicket: isWicket || false,
      wicketType: wicketType || 'none',
      dismissedPlayer: dismissedPlayer || '',
      commentary: commentary || `${runs || 0} runs`,
      timestamp: new Date()
    };

    // Update innings stats
    currentInnings.ballByBall.push(ball);
    currentInnings.balls += 1;
    currentInnings.score += (runs || 0) + (extras || 0);
    currentInnings.overs = parseFloat((currentInnings.balls / 6).toFixed(1));

    if (extras) {
      currentInnings.extras += extras;
    }

    if (isWicket) {
      currentInnings.wickets += 1;
    }

    // Update batsman stats
    if (batsman && currentInnings.currentBatsmen.length > 0) {
      const batsmanIndex = currentInnings.currentBatsmen.findIndex(b => b.player === batsman);
      if (batsmanIndex !== -1) {
        currentInnings.currentBatsmen[batsmanIndex].runs += (runs || 0);
        currentInnings.currentBatsmen[batsmanIndex].balls += 1;
        if (runs === 4) currentInnings.currentBatsmen[batsmanIndex].fours += 1;
        if (runs === 6) currentInnings.currentBatsmen[batsmanIndex].sixes += 1;
        
        const sr = (currentInnings.currentBatsmen[batsmanIndex].runs / 
                   currentInnings.currentBatsmen[batsmanIndex].balls * 100).toFixed(2);
        currentInnings.currentBatsmen[batsmanIndex].strikeRate = parseFloat(sr);
      }
    }

    // Update bowler stats
    if (bowler && currentInnings.currentBowler?.player === bowler) {
      currentInnings.currentBowler.runs += (runs || 0) + (extras || 0);
      if (isWicket) {
        currentInnings.currentBowler.wickets += 1;
      }
      
      const oversCompleted = Math.floor(currentInnings.balls / 6);
      currentInnings.currentBowler.overs = oversCompleted;
      
      if (oversCompleted > 0) {
        const economy = (currentInnings.currentBowler.runs / oversCompleted).toFixed(2);
        currentInnings.currentBowler.economy = parseFloat(economy);
      }
    }

    // Check if innings complete
    if (currentInnings.wickets >= 10 || currentInnings.overs >= liveMatch.totalOvers) {
      currentInnings.isCompleted = true;
      liveMatch.status = 'innings1Complete';
      console.log(`✅ Innings ${liveMatch.currentInnings} completed`);
    }

    liveMatch.lastUpdated = new Date();
    await liveMatch.save();

    // Emit socket event (if socket.io is configured)
    if (req.app.io) {
      req.app.io.emit(`match:${matchId}:update`, {
        ball,
        innings: currentInnings,
        status: liveMatch.status
      });
    }

    res.json({
      success: true,
      message: "Ball updated successfully",
      data: {
        ball,
        innings: currentInnings,
        status: liveMatch.status
      }
    });

  } catch (err) {
    console.error("❌ Error updating ball:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

/* -------------------------------------------------------
   📊 Get Live Match Data
-------------------------------------------------------- */
export const getLiveMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const liveMatch = await LiveMatch.findOne({ match: matchId })
      .populate('teamA teamB', 'teamName captainName')
      .populate('tossWinner', 'teamName')
      .populate('innings.battingTeam innings.bowlingTeam', 'teamName')
      .populate('match', 'venue scheduledTime stage');

    if (!liveMatch) {
      return res.status(404).json({
        success: false,
        message: "Live match not found"
      });
    }

    res.json({
      success: true,
      data: liveMatch
    });

  } catch (err) {
    console.error("❌ Error fetching live match:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

/* -------------------------------------------------------
   🔄 Complete Innings
-------------------------------------------------------- */
export const completeInnings = async (req, res) => {
  try {
    const { matchId } = req.params;

    const liveMatch = await LiveMatch.findOne({ match: matchId })
      .populate('teamA teamB', 'teamName');

    if (!liveMatch) {
      return res.status(404).json({
        success: false,
        message: "Live match not found"
      });
    }

    const currentInnings = liveMatch.innings[liveMatch.currentInnings - 1];
    currentInnings.isCompleted = true;

    if (liveMatch.currentInnings === 1) {
      // Start second innings
      const firstInningsBattingTeam = currentInnings.battingTeam;
      const secondInningsBattingTeam = firstInningsBattingTeam.toString() === liveMatch.teamA._id.toString() 
        ? liveMatch.teamB._id 
        : liveMatch.teamA._id;
      const secondInningsBowlingTeam = firstInningsBattingTeam;

      liveMatch.innings.push({
        inningsNumber: 2,
        battingTeam: secondInningsBattingTeam,
        bowlingTeam: secondInningsBowlingTeam,
        ballByBall: []
      });

      liveMatch.currentInnings = 2;
      liveMatch.status = 'innings1Complete';

      console.log(`✅ Innings 1 complete. Starting Innings 2...`);

    } else {
      // Match complete
      const innings1 = liveMatch.innings[0];
      const innings2 = liveMatch.innings[1];

      let winner, margin;

      if (innings2.score > innings1.score) {
        winner = innings2.battingTeam;
        margin = `${10 - innings2.wickets} wickets`;
      } else if (innings1.score > innings2.score) {
        winner = innings1.battingTeam;
        margin = `${innings1.score - innings2.score} runs`;
      } else {
        margin = "Match Tied";
      }

      liveMatch.result = {
        winner,
        margin,
        summary: `${winner ? liveMatch.teamA.teamName : "Tie"} won by ${margin}`
      };

      liveMatch.status = 'completed';

      // Update main match
      await Match.findByIdAndUpdate(matchId, {
        status: 'Completed',
        winner,
        scoreA: innings1.battingTeam.toString() === liveMatch.teamA._id.toString() ? innings1.score : innings2.score,
        scoreB: innings1.battingTeam.toString() === liveMatch.teamB._id.toString() ? innings1.score : innings2.score
      });

      console.log(`🏆 Match completed: ${liveMatch.result.summary}`);
    }

    await liveMatch.save();

    res.json({
      success: true,
      message: liveMatch.status === 'completed' ? "Match completed" : "Innings completed",
      data: liveMatch
    });

  } catch (err) {
    console.error("❌ Error completing innings:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

/* -------------------------------------------------------
   💬 Get Commentary
-------------------------------------------------------- */
export const getCommentary = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { limit = 20 } = req.query;

    const liveMatch = await LiveMatch.findOne({ match: matchId });

    if (!liveMatch) {
      return res.status(404).json({
        success: false,
        message: "Live match not found"
      });
    }

    const currentInnings = liveMatch.innings[liveMatch.currentInnings - 1];
    const commentary = currentInnings.ballByBall
      .slice(-limit)
      .reverse()
      .map(ball => ({
        over: ball.over,
        commentary: ball.commentary,
        runs: ball.runs,
        isWicket: ball.isWicket,
        timestamp: ball.timestamp
      }));

    res.json({
      success: true,
      data: commentary
    });

  } catch (err) {
    console.error("❌ Error fetching commentary:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

/* -------------------------------------------------------
   🎯 Set Current Players
-------------------------------------------------------- */
export const setCurrentPlayers = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { batsmen, bowler } = req.body;

    const liveMatch = await LiveMatch.findOne({ match: matchId });

    if (!liveMatch) {
      return res.status(404).json({
        success: false,
        message: "Live match not found"
      });
    }

    const currentInnings = liveMatch.innings[liveMatch.currentInnings - 1];

    // Set batsmen
    if (batsmen && Array.isArray(batsmen)) {
      currentInnings.currentBatsmen = batsmen.map(b => ({
        player: b,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0
      }));
    }

    // Set bowler
    if (bowler) {
      currentInnings.currentBowler = {
        player: bowler,
        overs: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        economy: 0
      };
    }

    await liveMatch.save();

    res.json({
      success: true,
      message: "Players set successfully",
      data: {
        batsmen: currentInnings.currentBatsmen,
        bowler: currentInnings.currentBowler
      }
    });

  } catch (err) {
    console.error("❌ Error setting players:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};