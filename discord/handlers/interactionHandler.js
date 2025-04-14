const { logger } = require("../../utils/logger");
const { checkPermissions } = require("../../utils/permissions");
const { restartBot } = require("../../utils/botManager");
const fs = require("fs");
const path = require("path");

/**
 * Handle slash command interactions
 */
async function handleCommandInteraction(interaction, client) {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`Command ${interaction.commandName} not found`);
    return;
  }

  try {
    // Check if permissions are required for this command
    if (command.permissions) {
      const hasPermission = checkPermissions(
        interaction.member,
        command.permissions
      );
      if (!hasPermission) {
        return interaction.reply({
          content: "You do not have permission to use this command.",
          ephemeral: true,
        });
      }
    }

    // Execute the command
    await command.execute(interaction, client);
  } catch (error) {
    logger.error(`Error executing command ${interaction.commandName}:`, error);

    // Reply to the user if we haven't already
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command.",
        ephemeral: true,
      });
    }
  }
}

/**
 * Handle button interactions
 */
async function handleButtonInteraction(interaction, client) {
  const buttonId = interaction.customId;

  try {
    // Handle restart confirmation button
    if (buttonId === "confirm_restart") {
      // Save restart info
      const restartInfoPath = path.join(
        __dirname,
        "../../temp/restartInfo.json"
      );
      const restartInfo = { channelId: interaction.channelId };

      // Create directory if it doesn't exist
      const dir = path.dirname(restartInfoPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write restart info
      fs.writeFileSync(restartInfoPath, JSON.stringify(restartInfo));

      // Update the interaction
      await interaction.update({
        content: "Restarting the bot...",
        components: [],
      });

      // Log the restart
      logger.info(
        `Bot restart initiated by ${interaction.user.tag} (${interaction.user.id})`
      );

      // Restart the bot
      try {
        await restartBot(client);
      } catch (error) {
        logger.error("Failed to restart bot:", error);
        await interaction.followUp(
          "Error: Failed to restart the bot. Check logs for details."
        );
      }
    }
    // Handle restart cancellation button
    else if (buttonId === "cancel_restart") {
      await interaction.update({
        content: "Bot restart canceled.",
        components: [],
      });
    }
    // Add other button handlers here
  } catch (error) {
    logger.error(`Error handling button interaction ${buttonId}:`, error);

    // Reply to the user if we haven't already
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error processing this interaction.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error processing this interaction.",
        ephemeral: true,
      });
    }
  }
}

module.exports = {
  handleCommandInteraction,
  handleButtonInteraction,
};
