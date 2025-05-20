# Advanced Anti-Bot Detection System

The CS News Discord Bot implements a sophisticated anti-bot detection system to reliably scrape news and other content from HLTV.org without being blocked.

## Core Components

### Browser Fingerprinting
- **Realistic Browser Profiles**: Multiple browser profiles with accurate fingerprints
- **TLS/SSL Fingerprinting**: Browser-specific TLS fingerprints that match real browsers
- **WebGL & Screen Profiles**: Realistic screen resolutions and rendering information
- **HTTP Headers**: Complete set of browser-specific headers
  
### Session Management
- **Cookie Handling**: Maintains cookie jars to persist sessions
- **Session Rotation**: Automatically rotates sessions to avoid detection patterns
- **Request Headers**: Dynamically adjusts headers based on context and history
- **Referrer Chains**: Creates realistic referrer paths mimicking user navigation

### Behavioral Emulation
- **Human-like Timing**: Variable delays between requests based on statistical models
- **Navigation Patterns**: Emulates realistic browsing behavior
- **Rate Limiting**: Enforces rate limits with human-like variability

### Advanced Features
- **Proxy Support**: Optional IP rotation via proxies (disabled by default)
- **Content-Specific Profiles**: Uses appropriate profiles for different content types
- **Anti-Detection Techniques**: Avoids common detection patterns used by websites

## Configuration

The anti-bot system can be configured in the `config.json` file:

```json
{
  "scraper": {
    "cacheTTLHours": 1,
    "maxRequestsPerInterval": 4,
    "requestIntervalMs": 60000,
    "useSessionRotation": true,
    "useProxies": false,
    "proxyType": "standard",
    "sessionTtl": 30,
    "maxSessions": 5,
    "defaultTimeout": 15000
  }
}
```

### Configuration Options
- **cacheTTLHours**: How long to cache scraped data (hours)
- **maxRequestsPerInterval**: Maximum requests in a time window
- **requestIntervalMs**: Time window for rate limiting (milliseconds)
- **useSessionRotation**: Whether to rotate browser sessions
- **useProxies**: Enable/disable proxy support
- **proxyType**: Type of proxies to use ("standard", "residential", "datacenter")
- **sessionTtl**: Session time-to-live before rotation (minutes)
- **maxSessions**: Maximum number of concurrent sessions
- **defaultTimeout**: Default request timeout (milliseconds)

## Files
- `browser-profiles.js`: Contains browser and crawler profile definitions
- `enhanced-fingerprints.js`: Advanced fingerprinting capabilities
- `cookie-jar.js`: Cookie handling and management
- `browser-session.js`: Browser session implementation

## Usage
The anti-bot system is automatically used by the scraper. No additional setup is required, though you may want to customize the configuration options.

## Notes
- The system is designed to respect website usage policies and implements proper rate limiting
- For high-volume scraping, consider enabling the proxy system and adding your own proxies
- Be aware that using these tools to bypass site restrictions may violate terms of service
