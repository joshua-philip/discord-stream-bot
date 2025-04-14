const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Streamer = require("../../database/models/streamer");
const { formatDuration, formatDate } = require("../../utils/formatters");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show streaming statistics for a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to check stats for")
        .setRequired(false)
    ),

  // No permissions required - anyone can use this command

  async execute(interaction) {
    // Defer reply as this might take a moment
    await interaction.deferReply();

    // Get the target user (or self if not specified)
    const targetUser = interaction.options.getUser("user") || interaction.user;

    try {
      // Get the streamer data
      const streamer = await Streamer.findByUserId(targetUser.id);

      if (!streamer) {
        return interaction.editReply(
          `No streaming data found for ${targetUser.username}.`
        );
      }

      // Create the embed
      const embed = new EmbedBuilder()
        .setTitle(`Streaming Statistics for ${targetUser.username}`)
        .setColor(0x6441a4) // Twitch purple
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      // Add fields for the statistics
      const totalHours = (streamer.totalDuration / (1000 * 60 * 60)).toFixed(2);

      embed.addFields(
        {
          name: "Total Streaming Time",
          value: `${totalHours} hours (${formatDuration(
            streamer.totalDuration
          )})`,
          inline: false,
        },
        {
          name: "Total Streaming Sessions",
          value: streamer.sessionCount.toString(),
          inline: true,
        }
      );

      // Add currently streaming status
      if (streamer.isCurrentlyStreaming && streamer.lastStartTime) {
        const streamDuration =
          Date.now() - new Date(streamer.lastStartTime).getTime();

        embed.addFields(
          { name: "Currently Streaming", value: "✅ Yes", inline: true },
          {
            name: "Current Session Duration",
            value: formatDuration(streamDuration),
            inline: true,
          }
        );

        if (streamer.recentStreamUrl) {
          embed.addFields({
            name: "Stream URL",
            value: streamer.recentStreamUrl,
            inline: false,
          });
        }
      } else {
        embed.addFields({
          name: "Currently Streaming",
          value: "❌ No",
          inline: true,
        });

        if (streamer.lastStopTime) {
          embed.addFields({
            name: "Last Stream",
            value: formatDate(streamer.lastStopTime),
            inline: true,
          });
        }
      }

      // Add recent stream titles if available
      if (streamer.streamTitles && streamer.streamTitles.length > 0) {
        const recentTitles = streamer.streamTitles
          .slice(-3)
          .map((title) => title.title)
          .filter(Boolean);

        if (recentTitles.length > 0) {
          embed.addFields({
            name: "Recent Stream Titles",
            value: recentTitles.join("\n"),
            inline: false,
          });
        }
      }

      // Send the embed
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching stats:", error);
      await interaction.editReply(
        "There was an error fetching the streaming statistics. Please try again later."
      );
    }
  },
};
