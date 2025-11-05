// src/models/player.model.js
import mongoose, { Schema } from "mongoose";

const playerSchema = new Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // Good for searching
    },
    // We can link this to a User account if a player registers
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true, // Allows null/missing values
    },
    // Track which teams they've played for
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "TeamRegistration",
      },
    ],

    // --- Career Batting Stats ---
    battingStats: {
      matchesPlayed: { type: Number, default: 0 },
      innings: { type: Number, default: 0 },
      totalRuns: { type: Number, default: 0 },
      ballsFaced: { type: Number, default: 0 },
      fifties: { type: Number, default: 0 },
      hundreds: { type: Number, default: 0 },
      highScore: { type: Number, default: 0 },
      outs: { type: Number, default: 0 }, // Important for average
    },

    // --- Career Bowling Stats ---
    bowlingStats: {
      matchesPlayed: { type: Number, default: 0 }, // Can be different from batting
      innings: { type: Number, default: 0 },
      ballsBowled: { type: Number, default: 0 },
      runsConceded: { type: Number, default: 0 },
      wicketsTaken: { type: Number, default: 0 },
      fiveWicketHauls: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const Player = mongoose.model("Player", playerSchema);