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

### Important: Enabling Message Content Intent (Optional)

If you want to enable command functionality (like `!csnews`):

1. In the [Discord Developer Portal](https://discord.com/developers/applications), go to your application
2. Navigate to the "Bot" tab
3. Scroll down to "Privileged Gateway Intents"
4. Enable "MESSAGE CONTENT INTENT"
5. Save your changes
6. Uncomment the command handling code in `index.js`

Without this intent enabled, the bot can only respond when mentioned, or you would need to implement slash commands.

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

## Troubleshooting

### Missing Access Error

If you see "DiscordAPIError[50001]: Missing Access", it means the bot doesn't have permission to access the channel. To fix this:

1. Make sure the bot is in the server containing the channel
2. Verify the channel ID is correct in your `.env` file
3. Check that the bot has proper permissions (see `bot_permissions_guide.md`)
4. Run the channel access test:
   ```
   npm run test:channel
   ```

### HLTV Access Issues

HLTV.org uses anti-bot measures that can block scrapers. If you see "Request failed with status code 403", the bot is being blocked by HLTV's protection. Our bot is designed to handle this with:

1. Multiple scraping methods (website, RSS feed, sitemap)
2. Local caching (data is cached for 1 hour by default)
3. Fallback content when all methods fail

You can test the scraper separately:
```
npm run test:scraper
```

If you continue to have issues, you might want to:
- Increase the cache TTL in `scraper.js` (change `cacheTTLHours` to a higher value)
- Run the bot on a server with a different IP address
- Consider implementing a solution with a legitimate browser automation like Puppeteer

### Message Content Intent Issues

If commands like `!csnews` don't work:

1. Enable the Message Content Intent in the Discord Developer Portal
2. Uncomment the command handling code in `index.js`
3. Restart the bot

For more detailed help, refer to the Discord.js documentation.

## License

ISC
