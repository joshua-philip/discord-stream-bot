const pino = require("pino");
const config = require("../config/config");

// Create a basic logger
const baseLogger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

// Enhanced logger with Discord webhook logging capability
const logger = {
  info: (message, ...args) => {
    baseLogger.info(message, ...args);
    sendToDiscord("INFO", message, args);
  },

  warn: (message, ...args) => {
    baseLogger.warn(message, ...args);
    sendToDiscord("WARNING", message, args);
  },

  error: (message, ...args) => {
    baseLogger.error(message, ...args);
    sendToDiscord("ERROR", message, args);
  },

  debug: (message, ...args) => {
    baseLogger.debug(message, ...args);
    // Don't send debug messages to Discord
  },
};

/**
 * Send a log message to Discord
 * @param {string} level Log level
 * @param {string} message Log message
 * @param {Array} args Additional arguments
 */
function sendToDiscord(level, message, args) {
  // We'll implement this later after the client is initialized
  // to avoid circular dependency

  // This will be called when we need to log to Discord
  setTimeout(() => {
    try {
      const client = require("../discord/client");

      // Skip if client is not ready or log channel is not set
      if (!client?.isReady() || !config.discord.channels.logs) return;

      const logChannel = client.channels.cache.get(
        config.discord.channels.logs
      );
      if (!logChannel) return;

      // Format the message
      let content = `**[${level}]** ${message}`;

      // Add additional arguments if they exist and are not empty
      if (args && args.length > 0 && args[0]) {
        // Convert objects to strings
        const formattedArgs = args.map((arg) => {
          if (arg instanceof Error) {
            return `${arg.message}\n${arg.stack}`;
          }
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        });

        // Add the formatted args to the content
        if (formattedArgs.some((arg) => arg.trim())) {
          content += `\n\`\`\`\n${formattedArgs.join("\n")}\n\`\`\``;
        }
      }

      // Truncate content if too long
      if (content.length > 1900) {
        content = content.substring(0, 1900) + "... (truncated)";
      }

      // Send the message
      logChannel.send(content).catch((err) => {
        baseLogger.error("Failed to send log to Discord:", err);
      });
    } catch (error) {
      baseLogger.error("Error sending log to Discord:", error);
    }
  }, 0);
}

module.exports = { logger };
