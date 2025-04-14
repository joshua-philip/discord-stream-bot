const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    lastJoinTime: {
      type: Date,
      default: null,
    },
    lastLeaveTime: {
      type: Date,
      default: null,
    },
    totalTimePlayed: {
      type: Number,
      default: 0,
    },
    sessionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
PlayerSchema.index({ userId: 1 });
PlayerSchema.index({ isPlaying: 1 });

// Methods
PlayerSchema.methods.joinServer = function () {
  const now = new Date();

  // Only start if not already playing
  if (!this.isPlaying) {
    this.lastJoinTime = now;
    this.isPlaying = true;
    this.sessionCount++;
  }

  return this.save();
};

PlayerSchema.methods.leaveServer = function () {
  const now = new Date();

  // Only process if currently playing
  if (this.isPlaying && this.lastJoinTime) {
    const duration = now - this.lastJoinTime;
    this.totalTimePlayed += duration;
    this.lastLeaveTime = now;
    this.isPlaying = false;
  }

  return this.save();
};

// Static methods
PlayerSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });
};

PlayerSchema.statics.getCurrentPlayers = function () {
  return this.find({ isPlaying: true })
    .select("userId username lastJoinTime")
    .exec();
};

PlayerSchema.statics.getPlaytimeLeaderboard = function (limit = 10) {
  return this.find()
    .sort({ totalTimePlayed: -1 })
    .limit(limit)
    .select("userId username totalTimePlayed sessionCount")
    .exec();
};

const Player = mongoose.model("Player", PlayerSchema);

module.exports = Player;
