// src/models/team.model.js
import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      name: String,
      rollNo: String,
      email: String,
    },
  ],
  captainName: {
    type: String,
    required: true,
  },
  captainEmail: {
    type: String,
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.Team || mongoose.model("Team", teamSchema);
