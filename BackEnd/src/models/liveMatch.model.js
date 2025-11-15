// src/models/liveMatch.model.js
import mongoose, { Schema } from "mongoose";

const ballSchema = new Schema({
  ballNumber: Number,
  over: String, // e.g., "1.1", "1.2"
  
  // ✅ CRITICAL: Player IDs for stats tracking
  batsmanId: {
    type: Schema.Types.ObjectId,
    ref: 'Player',
    required: true  // Make it required
  },
  bowlerId: {
    type: Schema.Types.ObjectId,
    ref: 'Player',
    required: true  // Make it required
  },
  
  // Display names (backup)
  batsman: String,
  bowler: String,
  batsmanName: String,
  bowlerName: String,
  
  runs: {
    type: Number,
    default: 0
  },
  extras: {
    type: Number,
    default: 0
  },
  extrasType: {
    type: String,
    enum: [
      'wide',
      'wides',      // ✅ Added - Cricsheet uses this
      'noBall',
      'noballs',    // ✅ Added - Cricsheet uses this
      'bye',
      'byes',       // ✅ Added - Cricsheet uses this
      'legBye',
      'legbyes',    // ✅ Added - Cricsheet uses this
      'none'
    ],
    default: 'none'
  },
  isWicket: {
    type: Boolean,
    default: false
  },
  wicketType: {
    type: String,
    enum: [
      'bowled',
      'caught',
      'caught and bowled',      // ✅ Added
      'caught behind',          // ✅ Added
      'lbw',
      'runOut',
      'run out',                // ✅ Added - Cricsheet format
      'stumped',
      'hitWicket',
      'hit wicket',             // ✅ Added - Cricsheet format
      'obstructing the field',  // ✅ Added
      'hit the ball twice',     // ✅ Added
      'timed out',              // ✅ Added
      'retired hurt',           // ✅ Added
      'handled the ball',       // ✅ Added
      'none'
    ],
    default: 'none'
  },
  dismissedPlayer: String,
  dismissedPlayerName: String,  // ✅ Added for consistency
  commentary: String,
  nonStriker: String,           // ✅ Added
  reviewType: String,           // ✅ Added
  playerOut: String,            // ✅ Added
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const inningsSchema = new Schema({
  inningsNumber: {
    type: Number,
    required: true
  },
  battingTeam: {
    type: Schema.Types.ObjectId,
    ref: "TeamRegistration",
    required: true
  },
  bowlingTeam: {
    type: Schema.Types.ObjectId,
    ref: "TeamRegistration",
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  wickets: {
    type: Number,
    default: 0
  },
  overs: {
    type: Number,
    default: 0
  },
  balls: {
    type: Number,
    default: 0
  },
  extras: {
    type: Number,
    default: 0
  },
  currentBatsmen: [{
    player: String,
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 }
  }],
  currentBowler: {
    player: String,
    overs: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    economy: { type: Number, default: 0 }
  },
  ballByBall: [ballSchema],
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const liveMatchSchema = new Schema({
  match: {
    type: Schema.Types.ObjectId,
    ref: "Match",
    required: true,
    unique: true
  },
  teamA: {
    type: Schema.Types.ObjectId,
    ref: "TeamRegistration",
    required: true
  },
  teamB: {
    type: Schema.Types.ObjectId,
    ref: "TeamRegistration",
    required: true
  },
  tossWinner: {
    type: Schema.Types.ObjectId,
    ref: "TeamRegistration"
  },
  tossDecision: {
    type: String,
    enum: ['bat', 'bowl']
  },
  currentInnings: {
    type: Number,
    default: 1
  },
  innings: [inningsSchema],
  status: {
    type: String,
    enum: ['notStarted', 'inProgress', 'innings1Complete', 'innings2Complete', 'completed'],
    default: 'inProgress'
  },
  result: {
    winner: {
      type: Schema.Types.ObjectId,
      ref: "TeamRegistration"
    },
    margin: String,
    summary: String
  },
  matchType: {
    type: String,
    enum: ['T20', 'ODI', 'T10'],
    default: 'T20'
  },
  totalOvers: {
    type: Number,
    default: 20
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// ✅ Indexes for performance
liveMatchSchema.index({ match: 1 });
liveMatchSchema.index({ status: 1 });
liveMatchSchema.index({ lastUpdated: -1 });

const LiveMatch = mongoose.model("LiveMatch", liveMatchSchema);
export default LiveMatch;