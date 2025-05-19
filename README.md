# CS News Discord Bot

A Discord bot that scrapes the latest Counter-Strike news, matches, and team rankings from HLTV.org and posts them to a specified Discord channel.

## Features

- Automatically scrapes news from HLTV.org
- Posts new articles to a specified Discord channel
- Shows upcoming matches with `!csmatches`
- Displays current team rankings with `!csteams`
- Avoids duplicate posts
- Configurable update interval
- Enhanced error handling and auto-restart capabilities
- Customizable through config.json
- Manual commands:
  - `!csnews` - Get latest news
  - `!csmatches` - See upcoming matches
  - `!csteams` - View current team rankings
  - `!help` - Show available commands

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a Discord bot at the [Discord Developer Portal](https://discord.com/developers/applications)
4. Get your bot token and set up the `.env` file:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   CHANNEL_ID=your_discord_channel_id_here
   UPDATE_INTERVAL=60  # minutes
   ```
5. Invite the bot to your server with proper permissions (Send Messages, Embed Links, Read Message History)
6. Start the bot:
   ```
   # Regular start
   npm start
   
   # Start with auto-restart capability
   npm run start:wrapper
   ```

## Customization

You can customize the bot by editing the `config.json` file:

```json
{
  "embedColor": "#0099ff",
  "footerText": "HLTV.org CS News Bot",
  "maxArticlesToKeep": 20,
  "delayBetweenMessages": 1000,
  "commands": {
    "checkNews": "!csnews",
    "matches": "!csmatches",
    "teams": "!csteams"
  },
  "logging": {
    "showStartupMessage": true,
    "showUpdateChecks": true
  }
}
```

## Getting Your Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Click "Reset Token" and copy your token
5. Add to your `.env` file

## Getting Your Channel ID

1. In Discord, enable Developer Mode in User Settings > Advanced
2. Right-click on the channel you want to use and select "Copy ID"
3. Add to your `.env` file

## Running the Bot Continuously

For production use, consider using a process manager like PM2:

```
npm install -g pm2
pm2 start index.js --name csnews-bot
```

## License

ISC
