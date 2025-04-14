// Configuration object to centralize all environment variables and constants
require("dotenv").config();

const config = {
  // Discord Configuration
  discord: {
    token: process.env.DISCORD_BOT_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.GUILD_ID,

    // Discord roles
    roles: {
      streaming: process.env.STREAMING_ROLE_ID,
      whitelisted: process.env.WHITELISTED_ROLE_ID,
      playing: process.env.PLAYING_ROLE_ID,
    },

    // Discord channels
    channels: {
      notification: process.env.NOTIFICATION_CHANNEL_ID,
      logs: process.env.LOG_CHANNEL_ID,
    },

    // Admin users and roles for commands
    adminUsers: process.env.ADMIN_USERS
      ? process.env.ADMIN_USERS.split(",")
      : [],
    adminRoles: process.env.ADMIN_ROLES
      ? process.env.ADMIN_ROLES.split(",")
      : [],
  },

  // Server API Configuration
  api: {
    port: parseInt(process.env.PORT || "3038", 10),
    secretKey: process.env.SECRET_KEY,
  },

  // MongoDB Configuration
  database: {
    uri: process.env.MONGODB_URI,
  },

  // PM2 Configuration
  pm2: {
    processName: process.env.PM2_NAME || "live-bot",
  },

  // Stream detection settings
  streamKeywords: ["StreamKeyword1", "StreamKeyword2"],

  // Stream notification cooldown in milliseconds (5 minutes)
  streamNotificationCooldown: 5 * 60 * 1000,

  // Limits for commands
  leaderboardLimit: 10,
};

module.exports = config;
