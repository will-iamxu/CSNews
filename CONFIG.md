# Configuration Options

This document explains all the available configuration options for the CS News Discord Bot.

## Configuration File

The bot uses a `config.json` file for configuration. You can copy `config.json.sample` as a starting point:

```bash
copy config.json.sample config.json
```

Then edit the `config.json` file with your settings.

## Discord Settings

```json
"discord": {
  "channelId": "your_channel_id_here",
  "updateInterval": 15,
  "embedColor": "#0099ff",
  "maxNewsPerUpdate": 3,
  "prefix": "!"
}
```

- **channelId**: The Discord channel ID where news will be posted
- **updateInterval**: How often to check for new articles (minutes)
- **embedColor**: Color of Discord embed messages (hex code)
- **maxNewsPerUpdate**: Maximum news items to post in a single update
- **prefix**: Command prefix for bot commands (e.g., `!csnews`)

## Scraper Settings

```json
"scraper": {
  "cacheTTLHours": 1,
  "maxRequestsPerInterval": 4,
  "requestIntervalMs": 60000,
  "useSessionRotation": true,
  "useProxies": false,
  "proxyType": "standard",
  "sessionTtl": 30,
  "maxSessions": 5,
  "defaultTimeout": 15000,
  "advanced": {
    "userAgentEnabled": true,
    "tlsFingerprintEnabled": true,
    "cookiesEnabled": true,
    "dynamicDelaysEnabled": true,
    "preferredBrowsers": ["Chrome", "Firefox"],
    "rotateReferrers": true,
    "evasionLevel": "medium"
  }
}
```

### Basic Settings
- **cacheTTLHours**: How long to cache scraped data (hours)

### Anti-Bot Detection Settings
- **maxRequestsPerInterval**: Maximum requests allowed in the time window
- **requestIntervalMs**: Time window in milliseconds (1 minute = 60000)
- **useSessionRotation**: Enable automatic session rotation
- **useProxies**: Enable proxy usage (requires proxy setup)
- **proxyType**: Type of proxies to use ("standard", "residential", "datacenter")
- **sessionTtl**: Session time-to-live in minutes before rotation
- **maxSessions**: Maximum number of concurrent sessions
- **defaultTimeout**: Default request timeout in milliseconds

### Advanced Settings
- **userAgentEnabled**: Use custom User-Agent strings
- **tlsFingerprintEnabled**: Use TLS fingerprinting
- **cookiesEnabled**: Enable cookie handling
- **dynamicDelaysEnabled**: Use human-like timing patterns
- **preferredBrowsers**: Preferred browser types to use for profiles
- **rotateReferrers**: Use realistic referrer chains
- **evasionLevel**: Strength of anti-detection measures ("low", "medium", "high")

## Logging Settings

```json
"logging": {
  "level": "info",
  "showTimestamp": true
}
```

- **level**: Logging level ("error", "warn", "info", "debug")
- **showTimestamp**: Show timestamps in logs

## Proxy Configuration

To use proxies with the bot, set `useProxies` to `true` and modify the `enhanced-fingerprints.js` file to include your proxy information in the `proxyConfigurations` section.

Example:
```javascript
const proxyConfigurations = {
  'standard': [
    { host: 'your-proxy-host.com', port: 8080, username: 'user1', password: 'pass1' },
    // More proxies...
  ]
};
```
