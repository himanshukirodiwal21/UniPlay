// /models/match.model.js
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
      ref: "Team",
      required: true,
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    // 🏁 Match stage (optional detail)
    stage: {
      type: String,
      enum: ["RoundRobin", "Semifinal", "Final", "3rdPlace"],
      default: "RoundRobin",
    },

    // 🔢 Round number (for RoundRobin format)
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
      ref: "Team",
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
  },
  { timestamps: true }
);

// ✅ Export model (safe for hot reload)
const Match = mongoose.models.Match || mongoose.model("Match", matchSchema);
export default Match;
