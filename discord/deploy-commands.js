// Script to register slash commands with Discord
require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const { logger } = require("../utils/logger");

const commands = [];
const commandsPath = path.join(__dirname, "commands");

// Read all command files
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

// Load commands and add to the commands array
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  // Each command should have a data and execute property
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
    logger.info(`Command added: ${command.data.name}`);
  } else {
    logger.warn(
      `The command at ${filePath} is missing required "data" or "execute" property.`
    );
  }
}

// Deploy commands
const rest = new REST({ version: "10" }).setToken(config.discord.token);

async function clearCommands() {
  try {
    logger.info("Started clearing application (/) commands.");

    // Clear guild commands
    await rest.put(
      Routes.applicationGuildCommands(
        config.discord.clientId,
        config.discord.guildId
      ),
      { body: [] }
    );

    logger.info("Successfully cleared all guild commands.");
  } catch (error) {
    logger.error("Error clearing guild commands:", error);
  }
}

(async () => {
  await clearCommands();
  try {
    logger.info(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(
        config.discord.clientId,
        config.discord.guildId
      ),
      { body: commands }
    );

    logger.info(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    logger.error("Error refreshing commands:", error);
  }
})();
