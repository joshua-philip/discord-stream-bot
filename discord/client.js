// Discord client singleton file to break circular dependencies
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Create a collection for commands
client.commands = new Collection();

module.exports = client;
