// Main Discord bot file
const { ActivityType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const { logger } = require("../utils/logger");
const { handlePresenceUpdate } = require("./handlers/presenceHandler");
const {
  handleCommandInteraction,
  handleButtonInteraction,
} = require("./handlers/interactionHandler");

// Import the client from client.js instead of creating it here
const client = require("./client");

// Load commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  // Set a new item in the Collection
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    logger.warn(
      `The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

// When the client is ready, run this code (only once)
client.once("ready", () => {
  logger.info(`Logged in as ${client.user.tag}`);

  // Set bot activity
  client.user.setActivity({
    name: "Stream Bot",
    type: ActivityType.Streaming,
    url: "https://twitch.tv/discord",
  });

  // Handle bot restart if needed
  const { handleBotRestart } = require("../utils/botManager");
  handleBotRestart(client);
});

// Handle interactions (slash commands, buttons, etc.)
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    await handleCommandInteraction(interaction, client);
  } else if (interaction.isButton()) {
    await handleButtonInteraction(interaction, client);
  }
});

// Handle presence updates (for streaming detection)
client.on("presenceUpdate", (oldPresence, newPresence) => {
  handlePresenceUpdate(oldPresence, newPresence, client);
});

// Start the Discord bot
const startDiscordBot = async () => {
  try {
    // Login to Discord with your client's token
    await client.login(config.discord.token);
    return client;
  } catch (error) {
    logger.error("Failed to start Discord bot:", error);
    throw error;
  }
};

module.exports = { startDiscordBot };
