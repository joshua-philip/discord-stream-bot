# Stream Tracking Discord Bot

A modern Discord bot for tracking streamers playing a game and managing server roles. This bot includes features for tracking stream sessions, maintaining player statistics, and providing notifications when users go live.

Built with Compatibility for FiveM, but not required.

## Features

- **Streamer Tracking**: Automatically detects when users start streaming with a detected keyword and assigns roles
- **Player Tracking**: Tracks when players join and leave the FiveM server
- **MongoDB Integration**: Stores all data in MongoDB for improved reliability and performance
- **Optimized for Large Servers**: Designed to work efficiently with servers of 70,000+ members
- **Leaderboard System**: Track and display top streamers based on time, sessions, etc.
- **Notification System**: Send Discord notifications when users start streaming
- **Command System**: Modern Discord.js v14 slash command implementation
- **Role Management**: Automatically assign/remove roles based on streaming/playing status
- **FiveM Integration**: Connect your FiveM server to the Discord bot

## Installation

### Prerequisites

- Node.js 16.x or higher
- MongoDB server
- Discord Bot Token
- PM2 (for production deployment)

### Setup

1. Clone the repository:

   ```
   git clone https://github.com/joshua-philip/live-bot.git
   cd live-bot
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create `.env` file:

   ```
   cp .env.example .env
   ```

4. Fill in the required values in `.env`

5. Deploy slash commands:

   ```
   npm run deploy-commands
   ```

6. Start the bot:
   ```
   npm start
   ```

### Production Deployment

For production, it's recommended to use PM2:

```
npm install -g pm2
pm2 start index.js --name live-bot
pm2 save
```

## FiveM Integration

To integrate with your FiveM server:

1. Copy the files from `stats_tracker` to a new resource folder in your FiveM server
2. Update the configuration in `server.lua` with your API key
3. Add the resource to your `server.cfg`
4. Restart your FiveM server

## Configuration

The main configuration is stored in the `.env` file and includes:

- Discord Bot Token and Client ID
- Guild ID
- Role IDs for streaming, whitelisted, and playing roles
- Channel IDs for notifications and logs
- MongoDB URI
- Admin User IDs and Role IDs
- API configuration

## Commands

### Public Commands

- `/help` - Show available commands and information
- `/stats [user]` - Show streaming statistics for a user
- `/streamers` - Show currently active streamers

### Moderator Commands

- `/leaderboard [type]` - Display the streaming leaderboard

### Admin Commands

- `/restart` - Restart the bot
- `/simulatestream <user> <action>` - Simulate a user starting or stopping a stream

## Project Structure

```
live-bot/
├── api/               # API server for FiveM integration
├── config/            # Configuration files
├── database/          # MongoDB models and connection
├── discord/           # Discord bot components
│   ├── commands/      # Slash commands
│   ├── handlers/      # Event handlers
│   └── notifications/ # Notification systems
├── logs/              # Log files
├── stats_tracker/       # FiveM integration scripts
├── temp/              # Temporary files
├── utils/             # Utility functions
├── .env               # Environment variables
├── .env.example       # Example environment file
├── index.js           # Main entry point
└── package.json       # Project dependencies
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
