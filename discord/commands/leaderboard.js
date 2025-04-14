const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Streamer = require("../../database/models/streamer");
const config = require("../../config/config");
const { formatDuration } = require("../../utils/formatters");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Display the streaming leaderboard")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of leaderboard to display")
        .setRequired(false)
        .addChoices(
          { name: "Streams", value: "streams" },
          { name: "Time", value: "time" },
          { name: "Sessions", value: "sessions" }
        )
    ),

  permissions: {
    roles: ["ADMIN", "MODERATOR", "STREAMER"],
    users: [],
    defaultAdmin: true,
  },

  async execute(interaction) {
    // Defer reply as this might take a moment
    await interaction.deferReply();

    // Get the type of leaderboard
    const type = interaction.options.getString("type") || "time";

    try {
      // Get all streamers
      let sortField;
      let title;

      switch (type) {
        case "sessions":
          sortField = "sessionCount";
          title = "🏆 Stream Sessions Leaderboard 🏆";
          break;
        case "streams":
          // For "streams", we'll still sort by totalDuration for now
          sortField = "totalDuration";
          title = "🏆 Current Streamers 🏆";
          break;
        case "time":
        default:
          sortField = "totalDuration";
          title = "🏆 Streaming Time Leaderboard 🏆";
          break;
      }

      let streamers;

      // Special case for "streams" to show only currently active streamers
      if (type === "streams") {
        streamers = await Streamer.find({ isCurrentlyStreaming: true })
          .sort({ lastStartTime: -1 })
          .limit(config.leaderboardLimit);
      } else {
        // Regular leaderboard sorted by the chosen field
        streamers = await Streamer.find()
          .sort({ [sortField]: -1 })
          .limit(config.leaderboardLimit);
      }

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(0x00ae86)
        .setTimestamp()
        .setFooter({ text: "Leaderboard data updates when streams end" });

      if (streamers.length === 0) {
        embed.setDescription("No streaming data available yet.");
        return interaction.editReply({ embeds: [embed] });
      }

      // Build description based on type
      let description = "";

      if (type === "streams") {
        description = "Currently live streamers:\n\n";

        streamers.forEach((streamer, index) => {
          const streamDuration = streamer.lastStartTime
            ? formatDuration(
                Date.now() - new Date(streamer.lastStartTime).getTime()
              )
            : "Unknown";

          description += `${index + 1}. <@${streamer.userId}>\n`;
          description += `⏱️ Live for: ${streamDuration}\n`;

          if (streamer.recentStreamUrl) {
            description += `🔗 [Watch Stream](${streamer.recentStreamUrl})\n`;
          }

          description += "\n";
        });
      } else {
        streamers.forEach((streamer, index) => {
          description += `${index + 1}. <@${streamer.userId}>\n`;

          if (type === "time") {
            const hours = (streamer.totalDuration / (1000 * 60 * 60)).toFixed(
              2
            );
            description += `⏱️ Total time: ${hours} hours\n`;
          }

          if (type === "sessions") {
            description += `🔄 Total sessions: ${streamer.sessionCount}\n`;
          }

          description += "\n";
        });
      }

      embed.setDescription(description);

      // Send the embed
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error generating leaderboard:", error);
      await interaction.editReply(
        "There was an error generating the leaderboard. Please try again later."
      );
    }
  },
};
