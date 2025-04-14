const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Restart the bot"),

  // Permissions required (see utils/permissions.js)
  permissions: {
    roles: ["ADMIN"],
    users: ["ADMIN"],
    defaultAdmin: true,
  },

  async execute(interaction) {
    // Create confirmation buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_restart")
        .setLabel("Yes, Restart!")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("cancel_restart")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content:
        "Are you sure you want to restart the bot? This will temporarily disconnect it.",
      components: [row],
      ephemeral: false,
    });
  },
};
