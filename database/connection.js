const mongoose = require("mongoose");
const { logger } = require("../utils/logger");

// Updated: Remove deprecated connection options
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("Successfully connected to MongoDB");
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    throw error; // Rethrow to be handled by the caller
  }

  // Handle connection events
  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected. Attempting to reconnect...");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("Reconnected to MongoDB");
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed through app termination");
      process.exit(0);
    } catch (err) {
      logger.error("Error during MongoDB disconnection:", err);
      process.exit(1);
    }
  });
}

module.exports = { connectToDatabase };
