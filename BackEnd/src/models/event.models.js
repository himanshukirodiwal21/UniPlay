import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);

