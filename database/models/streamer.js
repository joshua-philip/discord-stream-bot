const mongoose = require("mongoose");

const StreamerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: false, // Can be updated later
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    sessionCount: {
      type: Number,
      default: 0,
    },
    lastStartTime: {
      type: Date,
      default: null,
    },
    lastStopTime: {
      type: Date,
      default: null,
    },
    isCurrentlyStreaming: {
      type: Boolean,
      default: false,
    },
    recentStreamUrl: {
      type: String,
      default: null,
    },
    streamTitles: [
      {
        title: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create indexes for better performance
StreamerSchema.index({ userId: 1 });
StreamerSchema.index({ isCurrentlyStreaming: 1 });

// Methods
StreamerSchema.methods.startStreaming = function (url = null) {
  const now = new Date();

  // Only start if not already streaming
  if (!this.isCurrentlyStreaming) {
    this.lastStartTime = now;
    this.isCurrentlyStreaming = true;
    this.sessionCount++;

    if (url) {
      this.recentStreamUrl = url;
    }
  }

  return this.save();
};

StreamerSchema.methods.stopStreaming = function () {
  const now = new Date();

  // Only process if currently streaming
  if (this.isCurrentlyStreaming && this.lastStartTime) {
    const duration = now - this.lastStartTime;
    this.totalDuration += duration;
    this.lastStopTime = now;
    this.isCurrentlyStreaming = false;
  }

  return this.save();
};

StreamerSchema.methods.addStreamTitle = function (title) {
  if (!title) return this;

  this.streamTitles.push({ title, timestamp: new Date() });

  // Keep only the last 10 titles
  if (this.streamTitles.length > 10) {
    this.streamTitles = this.streamTitles.slice(-10);
  }

  return this.save();
};

// Static methods
StreamerSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });
};

StreamerSchema.statics.getLeaderboard = function (limit = 10) {
  return this.find()
    .sort({ totalDuration: -1 })
    .limit(limit)
    .select("userId username totalDuration sessionCount")
    .exec();
};

StreamerSchema.statics.getCurrentStreamers = function () {
  return this.find({ isCurrentlyStreaming: true })
    .select("userId username lastStartTime recentStreamUrl")
    .exec();
};

const Streamer = mongoose.model("Streamer", StreamerSchema);

module.exports = Streamer;
