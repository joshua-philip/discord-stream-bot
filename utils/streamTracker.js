const Streamer = require("../database/models/streamer");
const config = require("../config/config");
const { logger } = require("./logger");

/**
 * Cache for notification cooldowns to prevent spam
 * Key: userId, Value: timestamp of last notification
 */
const notificationCooldowns = new Map();

/**
 * Check if we should send a notification for a streamer
 * @param {string} userId Discord user ID
 * @returns {boolean} Whether to send a notification
 */
function shouldSendNotification(userId) {
  const now = Date.now();
  const lastNotification = notificationCooldowns.get(userId) || 0;

  // Check if the cooldown has passed
  if (now - lastNotification >= config.streamNotificationCooldown) {
    // Update the last notification time
    notificationCooldowns.set(userId, now);
    return true;
  }

  return false;
}

/**
 * Get all currently active streamers
 * @returns {Promise<Array>} Array of streamer documents
 */
async function getActiveStreamers() {
  try {
    return await Streamer.find({ isCurrentlyStreaming: true });
  } catch (error) {
    logger.error("Error getting active streamers:", error);
    return [];
  }
}

/**
 * Update streaming data for all streamers
 * This should be called periodically to update streaming durations
 * @returns {Promise<void>}
 */
async function updateStreamingData() {
  try {
    const activeStreamers = await getActiveStreamers();
    const now = Date.now();

    for (const streamer of activeStreamers) {
      // Calculate how long they've been streaming
      if (streamer.lastStartTime) {
        const duration = now - new Date(streamer.lastStartTime).getTime();

        // Only update if it's been streaming for a while (avoid unnecessary DB writes)
        if (duration > 5 * 60 * 1000) {
          // 5 minutes
          logger.debug(
            `Updating session duration for ${streamer.username} (${streamer.userId})`
          );

          // We don't need to update the database here
          // The duration will be properly saved when they stop streaming
        }
      }
    }
  } catch (error) {
    logger.error("Error updating streaming data:", error);
  }
}

/**
 * Initialize the stream tracker
 * This sets up periodic tasks like updating streaming data
 */
function initStreamTracker() {
  // Update streaming data every 5 minutes
  setInterval(updateStreamingData, 5 * 60 * 1000);

  logger.info("Stream tracker initialized");
}

/**
 * Clear the notification cooldown for a user
 * Useful when manually triggering notifications
 * @param {string} userId Discord user ID
 */
function clearNotificationCooldown(userId) {
  notificationCooldowns.delete(userId);
}

module.exports = {
  shouldSendNotification,
  getActiveStreamers,
  updateStreamingData,
  initStreamTracker,
  clearNotificationCooldown,
};
