// models/teamRegistration.model.js

import mongoose from "mongoose";

// ✅ Player subdocument schema with playerId reference
const playerSchema = new mongoose.Schema({
  // ✅ Reference to Player collection for stats tracking
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    default: null  // Optional - will be populated when linked
  },
  name: {
    type: String,
    required: [true, "Player name is required"],
    trim: true
  },
  role: {
    type: String,
    required: [true, "Player role is required"],
    enum: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper']
  },
  year: {
    type: String,
    required: [true, "Player year is required"],
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']
  },
  isCaptain: {
    type: Boolean,
    default: false
  },
  isViceCaptain: {
    type: Boolean,
    default: false
  }
}, { _id: true }); // ✅ Ensure each player gets an _id

// ✅ Main team registration schema
const teamRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true // ✅ Performance optimization
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null
    },
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      index: true // ✅ For faster searches
    },
    captainName: {
      type: String,
      required: [true, "Captain name is required"],
      trim: true
    },
    captainEmail: {
      type: String,
      required: [true, "Captain email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    captainPhone: {
      type: String,
      required: [true, "Captain phone is required"],
      trim: true,
      match: [/^[0-9+\s-()]{10,15}$/, "Please enter a valid phone number"]
    },
    captainCollege: {
      type: String,
      required: [true, "College/Institution name is required"],
      trim: true
    },
    players: {
      type: [playerSchema],
      validate: {
        validator: function(players) {
          return players.length === 15;
        },
        message: "Team must have exactly 15 players"
      }
    },
    registrationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true // ✅ For filtering by status
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// ✅ Validation: Exactly 1 captain and 1 vice-captain
teamRegistrationSchema.pre('save', function(next) {
  // Check captain count
  const captains = this.players.filter(p => p.isCaptain);
  if (captains.length !== 1) {
    return next(new Error('Team must have exactly one captain'));
  }
  
  // Check vice-captain count
  const viceCaptains = this.players.filter(p => p.isViceCaptain);
  if (viceCaptains.length !== 1) {
    return next(new Error('Team must have exactly one vice-captain'));
  }
  
  // Minimum 5 bowlers/all-rounders
  const bowlersAndAllRounders = this.players.filter(
    p => p.role === 'Bowler' || p.role === 'All-rounder'
  );
  if (bowlersAndAllRounders.length < 5) {
    return next(new Error('Team must have at least 5 bowlers or all-rounders'));
  }
  
  // Minimum 2 wicket-keepers
  const wicketKeepers = this.players.filter(p => p.role === 'Wicket-keeper');
  if (wicketKeepers.length < 2) {
    return next(new Error('Team must have at least 2 wicket-keepers'));
  }
  
  next();
});

// ✅ Add compound index for better query performance
teamRegistrationSchema.index({ eventId: 1, teamName: 1 });
teamRegistrationSchema.index({ eventId: 1, registrationStatus: 1 });

// ✅ Instance method to check if all players are linked
teamRegistrationSchema.methods.arePlayersLinked = function() {
  return this.players.every(player => player.playerId !== null);
};

// ✅ Instance method to get unlinked players
teamRegistrationSchema.methods.getUnlinkedPlayers = function() {
  return this.players.filter(player => player.playerId === null);
};

// ✅ Instance method to get linked players count
teamRegistrationSchema.methods.getLinkedPlayersCount = function() {
  return this.players.filter(player => player.playerId !== null).length;
};

// ✅ Static method to find teams by event with player stats
teamRegistrationSchema.statics.findByEventWithStats = async function(eventId) {
  return this.find({ eventId })
    .populate({
      path: 'players.playerId',
      select: 'name battingStats bowlingStats'
    })
    .exec();
};

const TeamRegistration = mongoose.model("TeamRegistration", teamRegistrationSchema);

export default TeamRegistration;