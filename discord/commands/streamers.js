const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Streamer = require("../../database/models/streamer");
const { formatDuration } = require("../../utils/formatters");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("streamers")
    .setDescription("Show currently active streamers"),

  // No permissions required - anyone can use this command

  async execute(interaction) {
    await interaction.deferReply();

    try {
      // Get all active streamers
      const activeStreamers = await Streamer.find({
        isCurrentlyStreaming: true,
      }).sort({ lastStartTime: -1 });

      if (activeStreamers.length === 0) {
        return interaction.editReply("No one is currently streaming.");
      }

      // Create the embed
      const embed = new EmbedBuilder()
        .setTitle("🎮 Currently Active Streamers")
        .setColor(0x6441a4) // Twitch purple
        .setTimestamp()
        .setFooter({ text: `${activeStreamers.length} active streamers` });

      // Add each streamer to the description
      let description = "";

      for (const streamer of activeStreamers) {
        const streamDuration = streamer.lastStartTime
          ? formatDuration(
              Date.now() - new Date(streamer.lastStartTime).getTime()
            )
          : "Unknown";

        description += `• <@${streamer.userId}>\n`;
        description += `  ⏱️ Live for: ${streamDuration}\n`;

        if (streamer.recentStreamUrl) {
          description += `  🔗 [Watch Stream](${streamer.recentStreamUrl})\n`;
        }

        description += "\n";
      }

      embed.setDescription(description);

      // Send the embed
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching active streamers:", error);
      await interaction.editReply(
        "There was an error fetching the active streamers. Please try again later."
      );
    }
  },
};
