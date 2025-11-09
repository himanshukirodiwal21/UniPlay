import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    // 🔗 Link to the event this match belongs to
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // ⚔️ Competing teams
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamRegistration",
      required: true,
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamRegistration",
      required: true,
    },

    // 🏁 Match stage
    stage: {
      type: String,
      enum: ["RoundRobin", "Semifinal", "Final", "3rdPlace"],
      default: "RoundRobin",
    },

    // 🔢 Round number
    round: {
      type: Number,
      default: 1,
    },

    // 📊 Match status
    status: {
      type: String,
      enum: ["Scheduled", "InProgress", "Completed", "Postponed"],
      default: "Scheduled",
    },

    // 🏏 Scores
    scoreA: {
      type: Number,
      default: 0,
      min: 0,
    },
    scoreB: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 🏆 Winner reference
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamRegistration",
      default: null,
    },

    // 📅 Scheduled time & venue
    scheduledTime: {
      type: Date,
      default: Date.now,
    },
    venue: {
      type: String,
      default: "TBD",
      trim: true,
    },

    // ✅ NEW: Innings data for player stats tracking
    innings: [
      {
        battingTeam: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TeamRegistration",
        },
        bowlingTeam: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TeamRegistration",
        },
        batsmen: [
          {
            playerId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Player",
            },
            playerName: String,
            runs: { type: Number, default: 0 },
            balls: { type: Number, default: 0 },
            fours: { type: Number, default: 0 },
            sixes: { type: Number, default: 0 },
            isOut: { type: Boolean, default: false },
            dismissalType: String, // "Bowled", "Caught", "LBW", etc.
          },
        ],
        bowlers: [
          {
            playerId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Player",
            },
            playerName: String,
            overs: { type: Number, default: 0 },
            balls: { type: Number, default: 0 },
            runs: { type: Number, default: 0 },
            wickets: { type: Number, default: 0 },
            maidens: { type: Number, default: 0 },
          },
        ],
        totalRuns: { type: Number, default: 0 },
        totalWickets: { type: Number, default: 0 },
        totalOvers: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Export model
const Match = mongoose.models.Match || mongoose.model("Match", matchSchema);
export default Match;