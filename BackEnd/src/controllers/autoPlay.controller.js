// src/controllers/autoPlay.controller.js
import AutoPlay from "../models/autoPlay.model.js";
import LiveMatch from "../models/liveMatch.model.js";
import Match from "../models/match.model.js";
import { Player } from "../models/player.model.js";
import { io } from "../index.js";
import {
  parseCricsheetJSON,
  mapPlayersToIds,
  validateCricsheetJSON,
} from "../utils/cricsheetParser.js";

// 🎯 Active playback intervals (in-memory storage)
const activePlaybacks = new Map();

/**
 * 📤 Upload Cricsheet JSON file
 */
export const uploadAutoPlayJSON = async (req, res) => {
  try {
    const { matchId } = req.params;
    const jsonData = req.body; // Expecting parsed JSON in body

    // Validate JSON structure
    const validation = validateCricsheetJSON(jsonData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Cricsheet JSON format",
        errors: validation.errors,
      });
    }

    // Check if match exists
    const match = await Match.findById(matchId).populate("teamA teamB");
    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // Check if LiveMatch exists
    let liveMatch = await LiveMatch.findOne({ match: matchId });
    if (!liveMatch) {
      return res.status(400).json({
        success: false,
        message: "Please initialize the match first before uploading auto-play data",
      });
    }

    // Parse Cricsheet JSON
    const { matchInfo, innings, allPlayerNames } =
      parseCricsheetJSON(jsonData);

    // Map player names to IDs
    const playerMapping = await mapPlayersToIds(allPlayerNames, Player, [
      match.teamA._id,
      match.teamB._id,
    ]);

    // Add player IDs to balls
    const inningsWithIds = innings.map((inning) => ({
      ...inning,
      balls: inning.balls.map((ball) => ({
        ...ball,
        batsmanId: playerMapping.get(ball.batsmanName)?.playerId,
        bowlerId: playerMapping.get(ball.bowlerName)?.playerId,
      })),
    }));

    // Check if AutoPlay already exists
    let autoPlay = await AutoPlay.findOne({ match: matchId });

    if (autoPlay) {
      // Update existing
      autoPlay.matchInfo = matchInfo;
      autoPlay.innings = inningsWithIds;
      autoPlay.playerMapping = playerMapping;
      autoPlay.originalFileName = req.file?.originalname || "uploaded.json";
      autoPlay.fileSize = req.file?.size || 0;
      autoPlay.playbackState = {
        isPlaying: false,
        isPaused: false,
        currentInnings: 1,
        currentBallIndex: 0,
        speed: 1,
      };
      await autoPlay.save();
    } else {
      // Create new
      autoPlay = await AutoPlay.create({
        match: matchId,
        liveMatch: liveMatch._id,
        matchInfo,
        innings: inningsWithIds,
        playerMapping,
        originalFileName: req.file?.originalname || "uploaded.json",
        fileSize: req.file?.size || 0,
        uploadedBy: req.user?._id, // If auth middleware exists
      });
    }

    res.status(200).json({
      success: true,
      message: "Cricsheet JSON uploaded successfully",
      data: {
        totalInnings: innings.length,
        totalBalls: innings.reduce((sum, inn) => sum + inn.balls.length, 0),
        playersFound: allPlayerNames.length,
        autoPlayId: autoPlay._id,
      },
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload auto-play data",
    });
  }
};

/**
 * ▶️ Start Auto-Play
 */
export const startAutoPlay = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { speed = 1 } = req.body; // 0.5x, 1x, 2x, 3x

    const autoPlay = await AutoPlay.findOne({ match: matchId });
    if (!autoPlay) {
      return res.status(404).json({
        success: false,
        message: "No auto-play data found. Please upload JSON first.",
      });
    }

    // Check if already playing
    if (autoPlay.playbackState.isPlaying) {
      return res.status(400).json({
        success: false,
        message: "Auto-play is already running",
      });
    }

    // Update state
    autoPlay.playbackState.isPlaying = true;
    autoPlay.playbackState.isPaused = false;
    autoPlay.playbackState.speed = speed;
    await autoPlay.save();

    // Start playback scheduler
    startPlaybackScheduler(matchId);

    res.status(200).json({
      success: true,
      message: "Auto-play started",
      data: {
        speed,
        currentBall: autoPlay.playbackState.currentBallIndex,
      },
    });
  } catch (error) {
    console.error("❌ Start error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ⏸️ Pause Auto-Play
 */
export const pauseAutoPlay = async (req, res) => {
  try {
    const { matchId } = req.params;

    const autoPlay = await AutoPlay.findOne({ match: matchId });
    if (!autoPlay) {
      return res.status(404).json({
        success: false,
        message: "Auto-play data not found",
      });
    }

    autoPlay.playbackState.isPlaying = false;
    autoPlay.playbackState.isPaused = true;
    await autoPlay.save();

    // Stop scheduler
    stopPlaybackScheduler(matchId);

    res.status(200).json({
      success: true,
      message: "Auto-play paused",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ⏩ Change Speed
 */
export const changeSpeed = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { speed } = req.body; // 0.5, 1, 2, 3

    if (![0.5, 1, 2, 3].includes(speed)) {
      return res.status(400).json({
        success: false,
        message: "Invalid speed. Use 0.5, 1, 2, or 3",
      });
    }

    const autoPlay = await AutoPlay.findOne({ match: matchId });
    if (!autoPlay) {
      return res.status(404).json({
        success: false,
        message: "Auto-play data not found",
      });
    }

    autoPlay.playbackState.speed = speed;
    await autoPlay.save();

    // Restart scheduler with new speed
    if (autoPlay.playbackState.isPlaying) {
      stopPlaybackScheduler(matchId);
      startPlaybackScheduler(matchId);
    }

    res.status(200).json({
      success: true,
      message: `Speed changed to ${speed}x`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ⏹️ Stop Auto-Play
 */
export const stopAutoPlay = async (req, res) => {
  try {
    const { matchId } = req.params;

    const autoPlay = await AutoPlay.findOne({ match: matchId });
    if (!autoPlay) {
      return res.status(404).json({
        success: false,
        message: "Auto-play data not found",
      });
    }

    autoPlay.playbackState.isPlaying = false;
    autoPlay.playbackState.isPaused = false;
    autoPlay.playbackState.currentBallIndex = 0;
    autoPlay.playbackState.currentInnings = 1;
    await autoPlay.save();

    stopPlaybackScheduler(matchId);

    res.status(200).json({
      success: true,
      message: "Auto-play stopped and reset",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 📊 Get Auto-Play Status
 */
export const getAutoPlayStatus = async (req, res) => {
  try {
    const { matchId } = req.params;

    const autoPlay = await AutoPlay.findOne({ match: matchId });
    if (!autoPlay) {
      return res.status(404).json({
        success: false,
        message: "No auto-play data found",
      });
    }

    const currentInnings = autoPlay.innings[autoPlay.playbackState.currentInnings - 1];
    const totalBalls = currentInnings?.balls.length || 0;

    res.status(200).json({
      success: true,
      data: {
        isPlaying: autoPlay.playbackState.isPlaying,
        isPaused: autoPlay.playbackState.isPaused,
        currentInnings: autoPlay.playbackState.currentInnings,
        currentBall: autoPlay.playbackState.currentBallIndex,
        totalBalls,
        speed: autoPlay.playbackState.speed,
        progress: totalBalls > 0 ? (autoPlay.playbackState.currentBallIndex / totalBalls) * 100 : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// 🎮 PLAYBACK SCHEDULER (Core Logic)
// ========================================

const startPlaybackScheduler = async (matchId) => {
  // If already running, don't start again
  if (activePlaybacks.has(matchId)) {
    console.log(`⚠️ Playback already active for match ${matchId}`);
    return;
  }

  console.log(`▶️ Starting auto-play for match ${matchId}`);

  const playNextBall = async () => {
    try {
      const autoPlay = await AutoPlay.findOne({ match: matchId }).populate('liveMatch');
      
      if (!autoPlay || !autoPlay.playbackState.isPlaying) {
        stopPlaybackScheduler(matchId);
        return;
      }

      const { currentInnings, currentBallIndex, speed } = autoPlay.playbackState;
      const innings = autoPlay.innings[currentInnings - 1];

      if (!innings || currentBallIndex >= innings.balls.length) {
        // Innings complete
        console.log(`✅ Innings ${currentInnings} complete`);
        
        if (currentInnings < autoPlay.innings.length) {
          // Move to next innings
          autoPlay.playbackState.currentInnings += 1;
          autoPlay.playbackState.currentBallIndex = 0;
          await autoPlay.save();
          
          io.to(matchId).emit('innings-complete', {
            completedInnings: currentInnings,
            nextInnings: currentInnings + 1
          });
          
        } else {
          // Match complete
          console.log(`🏆 Match complete`);
          autoPlay.playbackState.isPlaying = false;
          await autoPlay.save();
          
          stopPlaybackScheduler(matchId);
          
          io.to(matchId).emit('match-complete', {
            message: 'Auto-play completed'
          });
          return;
        }
      }

      // Get current ball
      const ball = innings.balls[currentBallIndex];
      
      // Send ball to LiveMatch API
      const liveMatch = autoPlay.liveMatch;
      
      const ballData = {
        batsmanId: ball.batsmanId,
        bowlerId: ball.bowlerId,
        batsmanName: ball.batsmanName,
        bowlerName: ball.bowlerName,
        runs: ball.runs,
        extras: ball.extras,
        extrasType: ball.extrasType === 'none' ? 'none' : ball.extrasType,
        isWicket: ball.isWicket,
        wicketType: ball.wicketType,
        commentary: ball.commentary,
      };
      
      // Update LiveMatch (same as manual scoring)
      const currentInningsData = liveMatch.innings[liveMatch.currentInnings - 1];
      
      // Add ball to ballByBall
      currentInningsData.ballByBall.push({
        ballNumber: ball.ballNumber,
        over: ball.over,
        batsman: ball.batsmanName,
        batsmanId: ball.batsmanId,
        bowler: ball.bowlerName,
        bowlerId: ball.bowlerId,
        runs: ball.runs,
        extras: ball.extras,
        extrasType: ball.extrasType,
        isWicket: ball.isWicket,
        wicketType: ball.wicketType,
        commentary: ball.commentary,
      });
      
      // Update score
      currentInningsData.score += ball.runs + ball.extras;
      if (ball.isWicket) currentInningsData.wickets += 1;
      
      // Update overs (only for legal deliveries)
      if (ball.extrasType !== 'wides' && ball.extrasType !== 'noballs') {
        currentInningsData.balls += 1;
        currentInningsData.overs = parseFloat((currentInningsData.balls / 6).toFixed(1));
      }
      
      liveMatch.lastUpdated = new Date();
      await liveMatch.save();
      
      // Broadcast via Socket.IO
      io.to(matchId).emit('ball-updated', {
        ball: ballData,
        score: currentInningsData.score,
        wickets: currentInningsData.wickets,
        overs: currentInningsData.overs,
        currentBallIndex: currentBallIndex + 1,
      });
      
      // Move to next ball
      autoPlay.playbackState.currentBallIndex += 1;
      autoPlay.playbackState.lastPlayedAt = new Date();
      await autoPlay.save();
      
    } catch (error) {
      console.error('❌ Playback error:', error);
      stopPlaybackScheduler(matchId);
    }
  };

  // Calculate interval based on speed (default 3000ms = 3s)
  const getAutoPlay = await AutoPlay.findOne({ match: matchId });
  const baseInterval = 3000; // 3 seconds
  const interval = baseInterval / (getAutoPlay?.playbackState.speed || 1);

  const intervalId = setInterval(playNextBall, interval);
  activePlaybacks.set(matchId, intervalId);
  
  // Play first ball immediately
  playNextBall();
};

const stopPlaybackScheduler = (matchId) => {
  const intervalId = activePlaybacks.get(matchId);
  if (intervalId) {
    clearInterval(intervalId);
    activePlaybacks.delete(matchId);
    console.log(`⏹️ Stopped auto-play for match ${matchId}`);
  }
};