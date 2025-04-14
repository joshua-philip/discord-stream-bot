// Main application entry point
require("dotenv").config();
const { startDiscordBot } = require("./discord/bot");
const { startAPIServer } = require("./api/server");
const { connectToDatabase } = require("./database/connection");
const { logger } = require("./utils/logger");

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Promise Rejection:", error);
});

// Start the application
async function startApplication() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Start API server for FiveM integration
    await startAPIServer();

    // Start Discord bot
    await startDiscordBot();

    logger.info("Application started successfully");
  } catch (error) {
    logger.error("Failed to start application:", error);
    process.exit(1);
  }
}

startApplication();
