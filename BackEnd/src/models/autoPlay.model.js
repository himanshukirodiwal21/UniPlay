// src/models/autoPlay.model.js
import mongoose, { Schema } from "mongoose";

const autoPlayBallSchema = new Schema({
  ballNumber: { type: Number, required: true },
  over: { type: String, required: true }, // "0.1", "1.2", etc.
  
  // Player references (from Cricsheet we'll map names to IDs)
  batsmanId: {
    type: Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  bowlerId: {
    type: Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  
  // Backup names
  batsmanName: { type: String, required: true },
  bowlerName: { type: String, required: true },
  
  // Ball data
  runs: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
  extrasType: {
    type: String,
    enum: ['wides', 'noballs', 'byes', 'legbyes', 'none'],
    default: 'none'
  },
  
  // Wicket info
  isWicket: { type: Boolean, default: false },
  wicketType: {
    type: String,
    enum: [
      'caught', 
      'bowled', 
      'lbw', 
      'run out', 
      'stumped', 
      'hit wicket',
      'caught and bowled',      // ✅ Added
      'caught behind',          // ✅ Added
      'obstructing the field',  // ✅ Added
      'hit the ball twice',     // ✅ Added
      'timed out',              // ✅ Added
      'retired hurt',           // ✅ Added
      'handled the ball',       // ✅ Added
      'none'
    ],
    default: 'none'
  },
  dismissedPlayerName: String,
  
  // Commentary
  commentary: String,
  
  // Additional Cricsheet data
  nonStriker: String,
  reviewType: String,
  playerOut: String,
  
}, { _id: false });

const autoPlaySchema = new Schema({
  // Link to match
  match: {
    type: Schema.Types.ObjectId,
    ref: "Match",
    required: true,
    unique: true
  },
  
  liveMatch: {
    type: Schema.Types.ObjectId,
    ref: "LiveMatch",
    required: true
  },
  
  // Match metadata from Cricsheet
  matchInfo: {
    matchType: String,
    gender: String,
    venue: String,
    city: String,
    dates: [String],
    teams: [String],
    tossWinner: String,
    tossDecision: String,
  },
  
  // All balls data (parsed from Cricsheet JSON)
  innings: [
    {
      inningsNumber: Number,
      battingTeam: String, // Team name from Cricsheet
      bowlingTeam: String,
      balls: [autoPlayBallSchema]
    }
  ],
  
  // Auto-play state
  playbackState: {
    isPlaying: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
    currentInnings: { type: Number, default: 1 },
    currentBallIndex: { type: Number, default: 0 },
    speed: { type: Number, default: 1 }, // 0.5x, 1x, 2x, 3x
    lastPlayedAt: Date
  },
  
  // Player mapping (Cricsheet name → MongoDB Player ID)
  playerMapping: {
    type: Map,
    of: {
      playerId: Schema.Types.ObjectId,
      playerName: String,
      team: String
    }
  },
  
  // Upload info
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  
  // Original file reference
  originalFileName: String,
  fileSize: Number,
  
}, { 
  timestamps: true 
});

// Index for quick lookups
autoPlaySchema.index({ match: 1 });
autoPlaySchema.index({ 'playbackState.isPlaying': 1 });

const AutoPlay = mongoose.model("AutoPlay", autoPlaySchema);
export default AutoPlay;