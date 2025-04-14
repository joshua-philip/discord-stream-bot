const Streamer = require("../../database/models/streamer");
const { logger } = require("../../utils/logger");
const config = require("../../config/config");
const {
  getActiveStreamers,
  shouldSendNotification,
} = require("../../utils/streamTracker");
const {
  sendStreamNotification,
} = require("../notifications/streamNotification");
const { emojiRegex } = require("../../utils/common");

/**
 * Handle presence updates for streaming detection
 * This is optimized to only process relevant presence updates
 */
async function handlePresenceUpdate(oldPresence, newPresence, client) {
  // Skip if member data is missing
  if (!newPresence.member) return;

  // Check if user is whitelisted, skip if not
  const isWhitelisted = newPresence.member.roles.cache.has(
    config.discord.roles.whitelisted
  );
  if (!isWhitelisted) return;

  // Find the streaming activity (type 1 is streaming)
  const newStreamingActivity = newPresence.activities.find(
    (activity) => activity.type === 1
  );
  const oldStreamingActivity = oldPresence?.activities.find(
    (activity) => activity.type === 1
  );

  // Check if streaming status changed
  const isStreaming = !!newStreamingActivity;
  const wasStreaming = !!oldStreamingActivity;

  // Skip if no change in streaming status
  if (isStreaming === wasStreaming && !isKeywordRelated(newStreamingActivity))
    return;

  // Handle streaming start
  if (isStreaming && !wasStreaming && isKeywordRelated(newStreamingActivity)) {
    await handleStreamStart(newPresence, newStreamingActivity, client);
  }

  // Handle streaming stop
  else if (!isStreaming && wasStreaming) {
    await handleStreamStop(newPresence, client);
  }
}

/**
 * Check if streaming activity contains related keywords
 */
function isKeywordRelated(activity) {
  if (!activity) return false;

  // Clean text from emojis
  const details = activity.details
    ? activity.details.replace(emojiRegex, "")
    : "";
  const state = activity.state ? activity.state.replace(emojiRegex, "") : "";

  // Check for keywords in details or state
  return config.streamKeywords.some(
    (keyword) => details.includes(keyword) || state.includes(keyword)
  );
}

/**
 * Handle when a user starts streaming
 */
async function handleStreamStart(newPresence, streamingActivity, client) {
  try {
    const userId = newPresence.member.id;
    const username = newPresence.member.user.tag;
    const url = streamingActivity.url;
    const title = streamingActivity.details || "";

    // Get or create streamer document
    let streamer = await Streamer.findByUserId(userId);
    if (!streamer) {
      streamer = new Streamer({
        userId,
        username,
      });
    }

    // Update streamer status
    await streamer.startStreaming(url);
    await streamer.addStreamTitle(title);

    // Add streaming role
    const guild = client.guilds.cache.get(config.discord.guildId);
    const member = await guild.members.fetch(userId);
    const streamingRole = guild.roles.cache.get(config.discord.roles.streaming);

    if (streamingRole) {
      await member.roles.add(streamingRole);
      logger.info(`Added streaming role to ${username} (${userId})`);
    }

    // Check if we should send notification (based on cooldown)
    if (shouldSendNotification(userId)) {
      await sendStreamNotification(streamer, client);
    }
  } catch (error) {
    logger.error("Error handling stream start:", error);
  }
}

/**
 * Handle when a user stops streaming
 */
async function handleStreamStop(newPresence, client) {
  try {
    const userId = newPresence.member.id;
    const username = newPresence.member.user.tag;

    // Update streamer status in database
    const streamer = await Streamer.findByUserId(userId);
    if (streamer) {
      await streamer.stopStreaming();
    }

    // Remove streaming role
    const guild = client.guilds.cache.get(config.discord.guildId);
    const member = await guild.members.fetch(userId);
    const streamingRole = guild.roles.cache.get(config.discord.roles.streaming);

    if (streamingRole && member.roles.cache.has(streamingRole.id)) {
      await member.roles.remove(streamingRole);
      logger.info(`Removed streaming role from ${username} (${userId})`);
    }
  } catch (error) {
    logger.error("Error handling stream stop:", error);
  }
}

module.exports = { handlePresenceUpdate };
