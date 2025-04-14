const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config");
const { logger } = require("../../utils/logger");
const { formatDuration } = require("../../utils/formatters");

/**
 * Send a notification when a user starts streaming
 * @param {Object} streamer Streamer document
 * @param {import('discord.js').Client} client Discord client
 * @returns {Promise<void>}
 */
async function sendStreamNotification(streamer, client) {
  try {
    const { userId, username, recentStreamUrl } = streamer;

    // Skip if there's no notification channel or stream URL
    if (!config.discord.channels.notification || !recentStreamUrl) {
      return;
    }

    // Get the notification channel
    const channel = client.channels.cache.get(
      config.discord.channels.notification
    );
    if (!channel) {
      logger.warn(
        `Notification channel not found: ${config.discord.channels.notification}`
      );
      return;
    }

    // Get the user's current streaming activity for additional details
    const guild = client.guilds.cache.get(config.discord.guildId);
    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) {
      logger.warn(`Member not found for stream notification: ${userId}`);
      return;
    }

    // Get the streaming activity
    const streamingActivity = member.presence?.activities.find(
      (activity) => activity.type === 1
    );

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(0x6441a4) // Twitch purple
      .setTitle(`${member.displayName} is live streaming!`)
      .setURL(recentStreamUrl)
      .setTimestamp();

    // Add thumbnail if available
    if (member.user.displayAvatarURL()) {
      embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
    }

    // Add stream details if available
    if (streamingActivity) {
      if (streamingActivity.details) {
        embed.setDescription(streamingActivity.details);
      }

      // Add additional fields
      if (streamingActivity.state) {
        embed.addFields({
          name: "Category",
          value: streamingActivity.state,
          inline: true,
        });
      }

      // Add how long they've been streaming
      if (streamingActivity.createdTimestamp) {
        const duration = Date.now() - streamingActivity.createdTimestamp;
        embed.addFields({
          name: "Live for",
          value: formatDuration(duration),
          inline: true,
        });
      }
    } else {
      // Fallback description if no activity details
      embed.setDescription("Check out their stream!");
    }

    // Add stream URL and mention
    const message = `🎮 **${member.displayName}** is now live! ${recentStreamUrl} <@${userId}>`;

    // Send the notification
    await channel.send({ content: message, embeds: [embed] });

    logger.info(`Sent stream notification for ${username} (${userId})`);
  } catch (error) {
    logger.error("Error sending stream notification:", error);
  }
}

module.exports = { sendStreamNotification };
