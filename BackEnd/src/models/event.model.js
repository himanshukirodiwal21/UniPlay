import mongoose from "mongoose";

// This sub-schema will be used for the leaderboard array
const leaderboardEntry = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team', // Make sure you have a 'Team' model
  },
  played: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  points: { type: Number, default: 0 }, // e.g., 3 for win, 1 for draw, 0 for loss
});

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    eligibility: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    registrationFee: {
      type: Number,
    },
    winningPrize: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
    registeredTeams: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team', // Assumes you have a 'Team' model
    }],
    
    leaderboard: [leaderboardEntry], // Uses the sub-schema defined above
    
    scheduleGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);



export const Event = mongoose.model("Event", eventSchema);
