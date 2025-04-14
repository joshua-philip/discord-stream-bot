const express = require("express");
const router = express.Router();
const Player = require("../../database/models/player");
const { validateSecret } = require("../middleware/auth");
const config = require("../../config/config");
const { logger } = require("../../utils/logger");
const fs = require("fs");
const path = require("path");

// Fix circular dependency - get the client directly when needed
let client;
function getClient() {
  if (!client) {
    // Only require the client when needed to avoid circular dependency
    client = require("../../discord/bot").client;
  }
  return client;
}

// Apply the secret validation middleware to all routes
router.use(validateSecret);

/**
 * Handle player joining/leaving the server
 * POST /api/player/event
 */
router.post("/event", async (req, res) => {
  try {
    const { action, playerId } = req.body;

    // Validate request
    if (!action || !playerId) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request. Missing action or playerId.",
      });
    }

    // Validate action
    if (action !== "join" && action !== "leave") {
      return res.status(400).json({
        status: "error",
        message: 'Invalid action. Must be "join" or "leave".',
      });
    }

    // Get the Discord guild
    const discordClient = getClient();
    if (!discordClient) {
      return res.status(500).json({
        status: "error",
        message: "Discord client not initialized.",
      });
    }

    const guild = discordClient.guilds.cache.get(config.discord.guildId);
    if (!guild) {
      return res.status(500).json({
        status: "error",
        message: "Discord guild not found.",
      });
    }

    // Fetch the member from Discord
    const member = await guild.members.fetch(playerId).catch(() => null);
    if (!member) {
      return res.status(404).json({
        status: "error",
        message: "Discord member not found.",
      });
    }

    // Get the FiveM role
    const playingRole = guild.roles.cache.get(config.discord.roles.playing);
    if (!playingRole) {
      return res.status(500).json({
        status: "error",
        message: "Playing role not found.",
      });
    }

    // Get or create player document
    let player = await Player.findByUserId(playerId);
    if (!player) {
      player = new Player({
        userId: playerId,
        username: member.user.tag,
      });
    }

    if (action === "join") {
      // Add role and update database
      await member.roles.add(playingRole);
      await player.joinServer();
      logger.info(`Player ${member.user.tag} (${playerId}) joined the server`);
    } else if (action === "leave") {
      // Remove role and update database
      await member.roles.remove(playingRole);
      await player.leaveServer();
      logger.info(`Player ${member.user.tag} (${playerId}) left the server`);
    }

    return res.status(200).json({
      status: "success",
      message: `Successfully processed ${action} event for player ${playerId}`,
    });
  } catch (error) {
    logger.error("Error processing player event:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * Get current online players
 * GET /api/player/online
 */
router.get("/online", async (req, res) => {
  try {
    const players = await Player.getCurrentPlayers();

    return res.status(200).json({
      status: "success",
      data: {
        count: players.length,
        players,
      },
    });
  } catch (error) {
    logger.error("Error getting online players:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

/**
 * Get player stats
 * GET /api/player/stats/:userId
 */
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const player = await Player.findByUserId(userId);

    if (!player) {
      return res.status(404).json({
        status: "error",
        message: "Player not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        player,
      },
    });
  } catch (error) {
    logger.error(`Error getting player stats for ${req.params.userId}:`, error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

module.exports = router;
