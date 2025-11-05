// src/controllers/liveMatch.controller.js
import LiveMatch from "../models/liveMatch.model.js";
import Match from "../models/match.model.js";
import { io } from "../index.js";

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

    // Create first innings
    const firstInnings = {
      inningsNumber: 1,
      battingTeam,
      bowlingTeam,
      score: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: 0,
      currentBatsmen: [],
      ballByBall: []
    };

    // Create live match
    const liveMatch = await LiveMatch.create({
      match: matchId,
      teamA: match.teamA._id,
      teamB: match.teamB._id,
      tossWinner,
      tossDecision,
      currentInnings: 1,
      innings: [firstInnings],
      status: 'inProgress',
      totalOvers: 20,
      lastUpdated: new Date()
    });

    // Update match status to InProgress
    await Match.findByIdAndUpdate(matchId, { status: 'InProgress' });

    console.log(`✅ Live match initialized: ${match.teamA.teamName} vs ${match.teamB.teamName}`);

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
   📊 Get Live Match Data
-------------------------------------------------------- */
export const getLiveMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    let liveMatch = await LiveMatch.findOne({ match: matchId })
      .populate('teamA teamB', 'teamName captainName')
      .populate('tossWinner', 'teamName')
      .populate('innings.battingTeam innings.bowlingTeam', 'teamName')
      .populate('match', 'venue scheduledTime stage');

    // ✨ Auto-initialize if not found
    if (!liveMatch) {
      const match = await Match.findById(matchId)
        .populate('teamA teamB', 'teamName');
      
      if (!match) {
        return res.status(404).json({ 
          success: false,
          message: "Match not found" 
        });
      }

      // Auto-initialize if match is InProgress or Scheduled
      if (match.status === 'InProgress' || match.status === 'Scheduled') {
        const firstInnings = {
          inningsNumber: 1,
          battingTeam: match.teamA._id,
          bowlingTeam: match.teamB._id,
          score: 0,
          wickets: 0,
          overs: 0,
          balls: 0,
          extras: 0,
          currentBatsmen: [],
          ballByBall: []
        };

        liveMatch = await LiveMatch.create({
          match: matchId,
          teamA: match.teamA._id,
          teamB: match.teamB._id,
          tossWinner: match.teamA._id,
          tossDecision: 'bat',
          currentInnings: 1,
          innings: [firstInnings],
          status: 'inProgress',
          totalOvers: 20
        });

        await Match.findByIdAndUpdate(matchId, { status: 'InProgress' });
        console.log(`✅ LiveMatch auto-created: ${matchId}`);

        // Re-populate
        liveMatch = await LiveMatch.findOne({ match: matchId })
          .populate('teamA teamB', 'teamName captainName')
          .populate('tossWinner', 'teamName')
          .populate('innings.battingTeam innings.bowlingTeam', 'teamName')
          .populate('match', 'venue scheduledTime stage');
      } else {
        return res.status(400).json({ 
          success: false,
          message: `Match is not live. Status: ${match.status}` 
        });
      }
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
   🏏 Update Ball (Ball-by-Ball) - ✅ UPDATED
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

    // Calculate over
    const totalBalls = currentInnings.balls + 1;
    const overNum = Math.floor(totalBalls / 6);
    const ballInOver = totalBalls % 6 === 0 ? 6 : totalBalls % 6;
    const overString = ballInOver === 6 ? `${overNum}` : `${overNum}.${ballInOver}`;

    // Create ball entry
    const ball = {
      ballNumber: totalBalls,
      over: overString,
      batsman: batsman || 'Unknown',
      bowler: bowler || 'Unknown',
      runs: runs || 0,
      extras: extras || 0,
      extrasType: extrasType || 'none',
      isWicket: isWicket || false,
      wicketType: wicketType || 'none',
      dismissedPlayer: dismissedPlayer || '',
      commentary: commentary || `${runs || 0} runs`,
      timestamp: new Date()
    };

    // Update innings
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

    // Check innings complete
    if (currentInnings.wickets >= 10 || currentInnings.overs >= liveMatch.totalOvers) {
      currentInnings.isCompleted = true;
      liveMatch.status = 'innings1Complete';
      console.log(`✅ Innings ${liveMatch.currentInnings} completed`);
    }

    liveMatch.lastUpdated = new Date();
    await liveMatch.save();

    // ✅ ============= UPDATE MATCH MODEL =============
    // Determine which score field to update (scoreA or scoreB)
    const innings1 = liveMatch.innings[0];
    let scoreA = 0, scoreB = 0;
    let currentBatting = 'teamA';
    let currentOvers = '0.0';
    let currentWickets = 0;

    if (liveMatch.currentInnings === 1) {
      // First innings - batting team is innings1.battingTeam
      if (innings1.battingTeam.toString() === liveMatch.teamA.toString()) {
        scoreA = innings1.score;
        currentBatting = 'teamA';
      } else {
        scoreB = innings1.score;
        currentBatting = 'teamB';
      }
      currentOvers = innings1.overs.toFixed(1);
      currentWickets = innings1.wickets;
    } else if (liveMatch.currentInnings === 2) {
      // Second innings
      const innings2 = liveMatch.innings[1];
      
      if (innings1.battingTeam.toString() === liveMatch.teamA.toString()) {
        scoreA = innings1.score;
        scoreB = innings2.score;
        currentBatting = 'teamB';
      } else {
        scoreA = innings2.score;
        scoreB = innings1.score;
        currentBatting = 'teamA';
      }
      currentOvers = innings2.overs.toFixed(1);
      currentWickets = innings2.wickets;
    }

    // Update Match model with current scores
    await Match.findByIdAndUpdate(matchId, {
      scoreA,
      scoreB,
      overs: currentOvers,
      wickets: currentWickets,
      currentBatting,
      status: 'InProgress'
    });

    console.log(`✅ Match model updated: scoreA=${scoreA}, scoreB=${scoreB}, overs=${currentOvers}, wickets=${currentWickets}`);

    // ✅ Fetch updated match with populated data for socket emission
    const updatedMatch = await Match.findById(matchId)
      .populate('teamA teamB', 'teamName')
      .lean();

    console.log('✅ Updated match fetched:', updatedMatch);

    // ✅ ============= EMIT SOCKET EVENT =============
    if (io) {
      io.to(matchId).emit('ball-updated', {
        matchId,
        match: updatedMatch,  // ✅ Full match data with scoreA, scoreB
        ball,
        innings: {
          score: currentInnings.score,
          wickets: currentInnings.wickets,
          overs: currentInnings.overs
        },
        status: liveMatch.status
      });
      console.log('📡 Socket emitted: ball-updated with match data');
    }

    res.json({
      success: true,
      message: "Ball updated successfully",
      data: {
        ball,
        currentScore: {
          runs: currentInnings.score,
          wickets: currentInnings.wickets,
          overs: currentInnings.overs
        },
        match: updatedMatch,
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
      const secondBattingTeam = currentInnings.battingTeam.toString() === liveMatch.teamA._id.toString() 
        ? liveMatch.teamB._id 
        : liveMatch.teamA._id;

      liveMatch.innings.push({
        inningsNumber: 2,
        battingTeam: secondBattingTeam,
        bowlingTeam: currentInnings.battingTeam,
        score: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        extras: 0,
        currentBatsmen: [],
        ballByBall: []
      });

      liveMatch.currentInnings = 2;
      liveMatch.status = 'innings1Complete';

      console.log(`✅ Innings 1 complete. Starting Innings 2`);
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
        summary: winner ? `Won by ${margin}` : "Match Tied"
      };

      liveMatch.status = 'completed';

      // Update main match
      await Match.findByIdAndUpdate(matchId, {
        status: 'Completed',
        winner,
        scoreA: innings1.battingTeam.toString() === liveMatch.teamA._id.toString() 
          ? innings1.score : innings2.score,
        scoreB: innings1.battingTeam.toString() === liveMatch.teamB._id.toString() 
          ? innings1.score : innings2.score
      });

      console.log(`🏆 Match completed`);
    }

    await liveMatch.save();

    // Emit socket
    if (io) {
      io.to(matchId).emit('innings-complete', {
        matchId,
        status: liveMatch.status,
        result: liveMatch.result
      });
    }

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