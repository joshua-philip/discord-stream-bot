const { SlashCommandBuilder } = require("discord.js");
const Streamer = require("../../database/models/streamer");
const config = require("../../config/config");
const { logger } = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("simulatestream")
    .setDescription(
      "Simulate a user starting or stopping a stream (Admin only)"
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to simulate")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Start or stop streaming")
        .setRequired(true)
        .addChoices(
          { name: "Start", value: "start" },
          { name: "Stop", value: "stop" }
        )
    ),

  // Permissions required
  permissions: {
    roles: [], // No role permissions
    users: ["OWNER"], // Only owner (use your ID in config)
    defaultAdmin: false, // Not available to Discord admins
  },

  async execute(interaction, client) {
    const user = interaction.options.getUser("user");
    const action = interaction.options.getString("action");

    if (!user) {
      return interaction.reply({
        content: "User not found.",
        ephemeral: true,
      });
    }

    try {
      await interaction.deferReply();

      const guild = client.guilds.cache.get(config.discord.guildId);
      const member = await guild.members.fetch(user.id).catch(() => null);

      if (!member) {
        return interaction.editReply(
          `User ${user.tag} is not a member of this server.`
        );
      }

      // Get streaming role
      const streamingRole = guild.roles.cache.get(
        config.discord.roles.streaming
      );

      if (!streamingRole) {
        return interaction.editReply("Streaming role not found.");
      }

      // Get or create streamer document
      let streamer = await Streamer.findByUserId(user.id);
      if (!streamer) {
        streamer = new Streamer({
          userId: user.id,
          username: user.tag,
        });
      }

      if (action === "start") {
        // Start streaming
        await streamer.startStreaming("https://twitch.tv/example");
        await member.roles.add(streamingRole);
        logger.info(`Simulated streaming start for ${user.tag} (${user.id})`);
        await interaction.editReply(
          `Simulated streaming start for ${user.tag}.`
        );
      } else {
        // Stop streaming
        await streamer.stopStreaming();
        await member.roles.remove(streamingRole);
        logger.info(`Simulated streaming stop for ${user.tag} (${user.id})`);
        await interaction.editReply(
          `Simulated streaming stop for ${user.tag}.`
        );
      }
    } catch (error) {
      logger.error(`Error simulating stream for ${user?.tag}:`, error);
      await interaction.editReply(
        "An error occurred while simulating the stream. Check logs for details."
      );
    }
  },
};
