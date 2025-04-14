const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermissions } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show available commands and information"),

  async execute(interaction, client) {
    // Get all registered commands
    const commands = [...client.commands.values()];

    // Create the embed
    const embed = new EmbedBuilder()
      .setTitle("Stream Bot - Help")
      .setColor(0x3498db)
      .setDescription("Here are the available commands for the Stream Bot:")
      .setTimestamp()
      .setFooter({ text: "Stream Bot" });

    // Group commands by permission level
    const publicCommands = [];
    const moderatorCommands = [];
    const adminCommands = [];

    // Check each command's permissions and add to the appropriate group
    for (const command of commands) {
      const name = `/${command.data.name}`;
      const description = command.data.description;

      const commandInfo = `**${name}** - ${description}`;

      if (!command.permissions) {
        // Public command (no permissions required)
        publicCommands.push(commandInfo);
      } else if (checkPermissions(interaction.member, command.permissions)) {
        // Check if this is an admin or moderator command
        const {
          roles = [],
          users = [],
          defaultAdmin = false,
        } = command.permissions;

        if (
          defaultAdmin ||
          roles.includes("ADMIN") ||
          users.includes("ADMIN") ||
          users.includes("OWNER")
        ) {
          adminCommands.push(commandInfo);
        } else {
          moderatorCommands.push(commandInfo);
        }
      }
    }

    // Add fields for each group of commands
    if (publicCommands.length > 0) {
      embed.addFields({
        name: "📢 Public Commands",
        value: publicCommands.join("\n"),
        inline: false,
      });
    }

    if (moderatorCommands.length > 0) {
      embed.addFields({
        name: "🛡️ Moderator Commands",
        value: moderatorCommands.join("\n"),
        inline: false,
      });
    }

    if (adminCommands.length > 0) {
      embed.addFields({
        name: "⚙️ Admin Commands",
        value: adminCommands.join("\n"),
        inline: false,
      });
    }

    // Send the embed
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
