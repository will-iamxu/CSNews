/**
 * Browser profile data for anti-bot detection
 * 
 * This module provides realistic browser fingerprinting data 
 * to help avoid bot detection on websites.
 */

// Generate list of modern browsers with realistic versions
const generateBrowserProfiles = () => {
  return [
    // Chrome profiles (Windows)
    {
      name: 'Chrome Windows',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      acceptLanguage: 'en-US,en;q=0.9',
      secChUa: '"Google Chrome";v="124", "Chromium";v="124", "Not-A.Brand";v="99"',
      secChUaPlatform: '"Windows"',
      secChUaMobile: '?0',
      weight: 30 // Higher weight = more likely to be selected
    },
    {
      name: 'Chrome Windows (older)',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      acceptLanguage: 'en-US,en;q=0.9',
      secChUa: '"Google Chrome";v="121", "Chromium";v="121", "Not-A.Brand";v="99"',
      secChUaPlatform: '"Windows"',
      secChUaMobile: '?0',
      weight: 25
    },
    
    // Chrome profiles (Mac)
    {
      name: 'Chrome macOS',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      acceptLanguage: 'en-US,en;q=0.9',
      secChUa: '"Google Chrome";v="124", "Chromium";v="124", "Not-A.Brand";v="99"',
      secChUaPlatform: '"macOS"',
      secChUaMobile: '?0',
      weight: 20
    },
    
    // Firefox profiles (Windows)
    {
      name: 'Firefox Windows',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      acceptLanguage: 'en-US,en;q=0.5',
      secChUa: null, // Firefox doesn't send sec-ch-ua headers
      secFetchDest: 'document',
      secFetchMode: 'navigate',
      secFetchSite: 'none',
      secFetchUser: '?1',
      weight: 15
    },
    
    // Firefox profiles (Mac)
    {
      name: 'Firefox macOS',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      acceptLanguage: 'en-US,en;q=0.5',
      secChUa: null,
      secFetchDest: 'document',
      secFetchMode: 'navigate',
      secFetchSite: 'none',
      secFetchUser: '?1',
      weight: 10
    },
    
    // Safari (Mac)
    {
      name: 'Safari macOS',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      acceptLanguage: 'en-US,en;q=0.9',
      secChUa: null,
      weight: 10
    },
    
    // Edge (Windows)
    {
      name: 'Edge Windows',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      acceptLanguage: 'en-US,en;q=0.9',
      secChUa: '"Microsoft Edge";v="124", "Chromium";v="124", "Not-A.Brand";v="99"',
      secChUaPlatform: '"Windows"',
      secChUaMobile: '?0',
      weight: 12
    },
    
    // Mobile browsers (for completeness)
    {
      name: 'Chrome Android',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.104 Mobile Safari/537.36',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      acceptLanguage: 'en-US,en;q=0.9',
      secChUa: '"Google Chrome";v="124", "Chromium";v="124", "Not-A.Brand";v="99"',
      secChUaPlatform: '"Android"',
      secChUaMobile: '?1',
      weight: 5
    },
    {
      name: 'Safari iOS',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      acceptLanguage: 'en-US,en;q=0.9',
      secChUa: null,
      weight: 5
    }
  ];
};

// Generate list of crawler-friendly user agents for feeds and sitemaps
const generateCrawlerProfiles = () => {
  return [
    {
      name: 'GoogleBot',
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      acceptLanguage: 'en-US,en;q=0.5',
      forTypes: ['sitemap', 'feed']
    },
    {
      name: 'GoogleBot-News',
      userAgent: 'Googlebot-News',
      accept: 'application/xml, text/xml, */*',
      acceptLanguage: 'en-US,en;q=0.5',
      forTypes: ['sitemap']
    },
    {
      name: 'BingBot',
      userAgent: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      acceptLanguage: 'en-US,en;q=0.5',
      forTypes: ['sitemap', 'feed']
    },
    {
      name: 'RSS Reader',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 (RSS Reader)',
      accept: 'application/rss+xml, application/xml, text/xml, */*',
      acceptLanguage: 'en-US,en;q=0.5',
      forTypes: ['feed']
    }
  ];
};

// Generate realistic referrers
const generateReferrers = () => {
  return [
    // Search engines
    'https://www.google.com/',
    'https://www.google.com/search?q=hltv+counter+strike+news',
    'https://www.google.com/search?q=csgo+tournament+schedule',
    'https://www.google.com/search?q=hltv+match+results',
    'https://www.bing.com/search?q=hltv+cs2+news',
    'https://www.bing.com/search?q=counter+strike+rankings',
    'https://duckduckgo.com/?q=hltv+cs2+news',
    'https://search.yahoo.com/search?p=hltv+counter+strike+news',
    
    // Social media
    'https://www.reddit.com/r/GlobalOffensive/',
    'https://www.reddit.com/r/GlobalOffensive/comments/abc123/',
    'https://twitter.com/',
    'https://facebook.com/',
    
    // Direct sources
    'https://www.hltv.org/',
    'https://www.hltv.org/matches',
    'https://www.hltv.org/news',
    
    // Gaming related
    'https://www.faceit.com/',
    'https://www.esea.net/',
    'https://liquipedia.net/counterstrike/',
    'https://www.vlr.gg/',
    
    // Empty referrer
    ''
  ];
};

module.exports = {
  browserProfiles: generateBrowserProfiles(),
  crawlerProfiles: generateCrawlerProfiles(),
  referrers: generateReferrers()
};
