const pm2 = require("pm2");
const { logger } = require("./logger");
const config = require("../config/config");

/**
 * Restart the bot using PM2
 * @param {import('discord.js').Client} client Discord client
 * @returns {Promise<void>}
 */
function restartBot(client) {
  return new Promise((resolve, reject) => {
    const processName = config.pm2.processName;

    // Disconnect the client first
    client.destroy();

    // Connect to PM2
    pm2.connect(function (err) {
      if (err) {
        logger.error("PM2 connection error:", err);
        pm2.disconnect();
        return reject(err);
      }

      // Restart the process
      pm2.restart(processName, (err) => {
        // Always disconnect from PM2 regardless of errors
        pm2.disconnect();

        if (err) {
          logger.error("PM2 restart error:", err);
          return reject(err);
        }

        logger.info(
          `Bot successfully restarted via PM2 (process: ${processName})`
        );
        resolve();
      });
    });
  });
}

/**
 * Handle bot startup after restart
 * @param {import('discord.js').Client} client Discord client
 */
async function handleBotRestart(client) {
  const fs = require("fs");
  const path = require("path");

  const restartInfoPath = path.join(__dirname, "../temp/restartInfo.json");

  // Check if a restart just occurred
  if (fs.existsSync(restartInfoPath)) {
    try {
      // Read the restart info
      const restartInfo = JSON.parse(fs.readFileSync(restartInfoPath, "utf8"));
      const restartChannelId = restartInfo.channelId;

      // Send message to the channel where restart was initiated
      if (restartChannelId) {
        const channel = client.channels.cache.get(restartChannelId);
        if (channel) {
          await channel.send("Bot restarted successfully!");
        }
      }

      // Clean up by removing the restart info file
      fs.unlinkSync(restartInfoPath);
    } catch (error) {
      logger.error("Error handling bot restart:", error);
    }
  }
}

module.exports = {
  restartBot,
  handleBotRestart,
};
