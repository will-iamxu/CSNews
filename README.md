# CS News Discord Bot

A Discord bot that scrapes the latest Counter-Strike news, matches, and team rankings from HLTV.org and posts them to a specified Discord channel.

## Features

- Automatically scrapes news from HLTV.org
- Posts new articles to a specified Discord channel
- Shows upcoming matches with `!csmatches`
- Displays current team rankings with `!csteams`
- Advanced anti-bot detection system ([see ANTIBOT.md](ANTIBOT.md))
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

You can customize the bot by creating a `config.json` file (use `config.json.sample` as a template):

```json
{
  "discord": {
    "channelId": "your_channel_id_here",
    "updateInterval": 15,
    "embedColor": "#0099ff",
    "maxNewsPerUpdate": 3,
    "prefix": "!"
  },
  "scraper": {
    "cacheTTLHours": 1,
    "maxRequestsPerInterval": 4,
    "requestIntervalMs": 60000,
    "useSessionRotation": true,
    "useProxies": false,
    "defaultTimeout": 15000
  },
  "logging": {
    "level": "info",
    "showTimestamp": true
  }
}
```

See [CONFIG.md](CONFIG.md) for detailed explanation of all configuration options.

The anti-bot detection system can be fine-tuned through these settings to balance between access reliability and avoiding detection. See [ANTIBOT.md](ANTIBOT.md) for more information on how the anti-bot system works.

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

HLTV.org uses anti-bot measures that can block scrapers. If you see "Request failed with status code 403", the bot is being blocked by HLTV's protection. Our bot now includes advanced anti-bot detection mechanisms:

1. Advanced browser fingerprinting system that mimics real browsers
2. Multiple scraping methods (website, RSS feed, sitemap)
3. Session management with cookie support and rotation
4. Rate limiting with human-like request patterns
5. Multiple fallback methods when access is restricted
6. Local caching (configurable cache time)

You can test the scraper and anti-bot system separately:
```
npm run test:scraper   # Test basic scraper functionality
npm run test:antibot   # Test anti-bot detection system
```

For detailed configuration of the anti-bot system, see [CONFIG.md](CONFIG.md) and [ANTIBOT.md](ANTIBOT.md).

If you continue to have issues:
- Adjust the anti-bot settings in your `config.json` file
- Enable proxy support (requires setting up proxies in `enhanced-fingerprints.js`)
- Increase the cache TTL in your config (change `cacheTTLHours` to a higher value)
- Run the bot on a server with a different IP address

### Message Content Intent Issues

If commands like `!csnews` don't work:

1. Enable the Message Content Intent in the Discord Developer Portal
2. Uncomment the command handling code in `index.js`
3. Restart the bot

For more detailed help, refer to the Discord.js documentation.

## License

ISC
