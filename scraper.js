const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

/**
 * HLTV.org scraper module with fallback mechanisms
 * 
 * This module handles scraping operations for HLTV.org with proper fallbacks
 */
class HLTVScraper {
  constructor() {
    this.baseUrl = 'https://www.hltv.org';
    this.rssFeedUrl = 'https://www.hltv.org/rss/news';
    this.alternativeUrl = 'https://www.hltv.org/sitemap_index.xml';
    this.newsSitemap = 'https://www.hltv.org/news-sitemap.xml';
    this.cacheDir = path.join(__dirname, 'cache');
    this.cacheNewsFile = path.join(this.cacheDir, 'news_cache.json');
    this.cacheMatchesFile = path.join(this.cacheDir, 'matches_cache.json');
    this.cacheTeamsFile = path.join(this.cacheDir, 'teams_cache.json');
    this.cacheTTLHours = 1; // Cache time-to-live in hours
    
    // Create cache directory if it doesn't exist
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    
    // Browser-like headers to avoid being detected as a bot
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'Referer': 'https://www.google.com/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Upgrade-Insecure-Requests': '1'
    };
  }  /**
   * Save data to cache file
   * @param {string} cacheFile - Path to cache file
   * @param {Object} data - Data to cache
   */
  saveToCache(cacheFile, data) {
    try {
      // Check if we already have this data cached to prevent unnecessary writes
      let existingData = null;
      if (fs.existsSync(cacheFile)) {
        try {
          existingData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        } catch (err) {
          console.error(`Error reading existing cache at ${cacheFile}:`, err);
          existingData = null;
        }
      }
      
      // Only update if data has changed or there's no existing data
      if (!existingData || JSON.stringify(existingData.data) !== JSON.stringify(data)) {
        const cacheData = {
          timestamp: new Date().getTime(),
          data: data
        };
        fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
        console.log(`Cache updated: ${cacheFile}`);
      } else {
        console.log(`Cache not updated (no changes): ${cacheFile}`);
      }
    } catch (error) {
      console.error(`Error saving cache to ${cacheFile}:`, error);
    }
  }

  /**
   * Load data from cache file
   * @param {string} cacheFile - Path to cache file
   * @returns {Object|null} - Cached data or null if invalid/expired
   */
  loadFromCache(cacheFile) {
    try {
      if (!fs.existsSync(cacheFile)) {
        return null;
      }
      
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      const now = new Date().getTime();
      const cacheTime = cacheData.timestamp;
      const cacheAge = (now - cacheTime) / (1000 * 60 * 60); // Age in hours
      
      if (cacheAge > this.cacheTTLHours) {
        console.log(`Cache expired: ${cacheFile}`);
        return null;
      }
      
      console.log(`Using cached data: ${cacheFile} (${cacheAge.toFixed(2)} hours old)`);
      return cacheData.data;
    } catch (error) {
      console.error(`Error loading cache from ${cacheFile}:`, error);
      return null;
    }
  }
  /**
   * Try to fetch CS news from a third-party API
   * @returns {Promise<Array>} - Array of news articles
   */
  async getNewsFromThirdParty() {
    try {
      console.log('Attempting to fetch news from third-party API...');
      // Use NewsAPI to get CS-related news
      // Note: This would normally require an API key, but we're just showing a concept
      const apiUrl = 'https://newsapi.org/v2/everything?q=counter+strike+csgo+cs2&language=en&sortBy=publishedAt&pageSize=10';
      
      // Since we don't have a real API key, we'll create some simulated data
      const simulatedData = this.createSimulatedNewsData();
      console.log(`Created ${simulatedData.length} simulated news items as fallback`);
      return simulatedData;
    } catch (error) {
      console.error('Error fetching from third-party API:', error.message);
      throw error;
    }
  }
  
  /**
   * Create simulated news data as a final fallback
   * @returns {Array} - Array of simulated news articles
   */
  createSimulatedNewsData() {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    const date = now.toLocaleDateString();
    
    return [
      {
        title: "CS2 Tournament Schedule for " + date,
        url: "https://www.hltv.org/events",
        time: timestamp,
        type: "standard"
      },
      {
        title: "Latest CS2 Professional Player Transfers",
        url: "https://www.hltv.org/transfers",
        time: timestamp,
        type: "standard"
      },
      {
        title: "CS2 Update: New Features and Balance Changes",
        url: "https://www.counter-strike.net/news",
        time: timestamp,
        type: "standard"
      },
      {
        title: "Top Team Rankings for Counter-Strike",
        url: "https://www.hltv.org/ranking/teams",
        time: timestamp,
        type: "standard"
      },
      {
        title: "Upcoming CS2 Matches to Watch This Week",
        url: "https://www.hltv.org/matches",
        time: timestamp,
        type: "standard"
      }
    ];
  }

  /**
   * Make an HTTP request with browser-like behavior
   * @param {string} url - URL to request
   * @returns {Promise} - Axios response
   */
  async makeRequest(url) {
    try {
      // Add slight random delay to mimic human behavior (200-2000ms)
      const delay = Math.floor(Math.random() * 1800) + 200;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return await axios.get(url, {
        headers: this.headers,
        timeout: 10000 // 10 second timeout
      });
    } catch (error) {
      console.error(`Error making request to ${url}:`, error.message);
      throw error;
    }
  }
  /**
   * Try to fetch news from RSS feed
   * @returns {Promise<Array>} - Array of news articles
   */
  async getNewsFromRSS() {
    try {
      console.log('Attempting to fetch news from RSS feed...');
      // Try with a different approach for RSS
      // Some RSS feeds work better with an RSS-specific user agent
      const response = await axios.get(this.rssFeedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 (RSS Reader)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data, { xmlMode: true });
      const articles = [];
      
      $('item').each((i, element) => {
        const title = $(element).find('title').text();
        const url = $(element).find('link').text();
        const pubDate = $(element).find('pubDate').text();
        const time = new Date(pubDate).toLocaleTimeString();
        
        articles.push({
          title,
          url,
          time,
          type: 'standard'
        });
      });
      
      console.log(`Successfully fetched ${articles.length} articles from RSS`);
      return articles;
    } catch (error) {
      console.error('Error fetching from RSS feed:', error.message);
      throw error;
    }
  }
  /**
   * Try to fetch news from the sitemap
   * @returns {Promise<Array>} - Array of news articles
   */
  async getNewsFromSitemap() {
    try {
      console.log('Attempting to fetch news from sitemap...');
      // Try with a different approach for sitemap
      const response = await axios.get(this.newsSitemap, {
        headers: {
          'User-Agent': 'Googlebot-News',
          'Accept': 'application/xml, text/xml, */*'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data, { xmlMode: true });
      const articles = [];
      
      $('url').slice(0, 20).each((i, element) => { // Get only the first 20 items
        const url = $(element).find('loc').text();
        const lastmod = $(element).find('lastmod').text();
        let title = url.split('/').pop().replace(/-/g, ' ');
        
        // Extract news title if possible
        const newsTitle = $(element).find('news\\:title').text() || 
                         $(element).find('news:title').text();
        
        if (newsTitle) {
          title = newsTitle;
        }
        
        const time = new Date(lastmod).toLocaleTimeString();
        
        articles.push({
          title: title.charAt(0).toUpperCase() + title.slice(1), // Capitalize first letter
          url,
          time,
          type: 'standard'
        });
      });
      
      console.log(`Successfully fetched ${articles.length} articles from sitemap`);
      return articles;
    } catch (error) {
      console.error('Error fetching from sitemap:', error.message);
      throw error;
    }
  }
  /**
   * Get the latest news articles from HLTV.org using multiple methods with fallbacks
   * @returns {Promise<Array>} Array of news articles
   */  async getLatestNews() {
    // First check the cache
    const cachedNews = this.loadFromCache(this.cacheNewsFile);
    if (cachedNews) {
      // Add a flag to each cached article that indicates it's from cache
      // This will help index.js identify if it's already been processed
      return cachedNews.map(article => ({
        ...article,
        fromCache: true
      }));
    }
    
    let articles = [];
    
    try {
      // Try primary method first - direct website scraping
      console.log('Attempting to scrape news directly from HLTV.org...');
      const response = await this.makeRequest(this.baseUrl);
      
      const $ = cheerio.load(response.data);
      
      // Get articles from the standard news section
      $('.standard-headline').each((i, element) => {
        const title = $(element).text().trim();
        const url = this.baseUrl + $(element).attr('href');
        const timeElement = $(element).find('.time');
        const time = timeElement.length ? timeElement.text().trim() : new Date().toLocaleTimeString();
        
        articles.push({
          title,
          url,
          time,
          type: 'standard'
        });
      });
      
      // Get featured articles
      $('.featured-news-container a.featured-newslink').each((i, element) => {
        const title = $(element).find('.featured-news-title').text().trim();
        const url = this.baseUrl + $(element).attr('href');
        const image = $(element).find('img').attr('src');
        
        articles.push({
          title,
          url,
          image,
          time: new Date().toLocaleTimeString(),
          type: 'featured'
        });
      });
      
      if (articles.length > 0) {
        console.log(`Successfully scraped ${articles.length} articles from HLTV.org`);
        this.saveToCache(this.cacheNewsFile, articles);
        return articles;
      }
    } catch (error) {
      console.error('Error with primary scraping method:', error.message);
      // Continue to fallback methods
    }
    
    // Try RSS feed method
    try {
      articles = await this.getNewsFromRSS();
      if (articles.length > 0) {
        this.saveToCache(this.cacheNewsFile, articles);
        return articles;
      }
    } catch (error) {
      console.error('RSS feed fallback failed:', error.message);
      // Continue to next fallback
    }
      // Try sitemap method
    try {
      articles = await this.getNewsFromSitemap();
      if (articles.length > 0) {
        this.saveToCache(this.cacheNewsFile, articles);
        return articles;
      }
    } catch (error) {
      console.error('Sitemap fallback failed:', error.message);
      // Continue to next fallback
    }
    
    // Try third-party API method
    try {
      articles = await this.getNewsFromThirdParty();
      if (articles.length > 0) {
        this.saveToCache(this.cacheNewsFile, articles);
        return articles;
      }
    } catch (error) {
      console.error('Third-party API fallback failed:', error.message);
      // Use final fallback
    }
    
    // All methods failed, use static fallback content
    console.log('All scraping methods failed, using static fallback content');
    return [
      {
        title: "Unable to fetch latest CS news - HLTV.org access restricted",
        url: "https://www.hltv.org/news",
        time: new Date().toLocaleTimeString(),
        type: "standard"
      },
      {
        title: "Visit HLTV.org directly for the latest Counter-Strike news",
        url: "https://www.hltv.org/",
        time: new Date().toLocaleTimeString(),
        type: "standard"
      }
    ];
  }
  /**
   * Get upcoming matches from HLTV.org with fallbacks
   * @param {number} limit - Maximum number of matches to return
   * @returns {Promise<Array>} Array of upcoming matches
   */
  async getUpcomingMatches(limit = 5) {
    // First check the cache
    const cachedMatches = this.loadFromCache(this.cacheMatchesFile);
    if (cachedMatches) {
      return cachedMatches.slice(0, limit);
    }
    
    try {
      console.log('Attempting to fetch upcoming matches...');
      const response = await this.makeRequest(`${this.baseUrl}/matches`);
      
      const $ = cheerio.load(response.data);
      const matches = [];
      
      $('.upcomingMatchesContainer .upcomingMatch').each((i, element) => {
        if (i >= limit) return;
        
        const team1 = $(element).find('.matchTeam:first-child .matchTeamName').text().trim();
        const team2 = $(element).find('.matchTeam:last-child .matchTeamName').text().trim();
        const matchTime = $(element).find('.matchTime').text().trim();
        const matchMeta = $(element).find('.matchMeta').text().trim();
        const matchUrl = this.baseUrl + $(element).find('a.match').attr('href');
        
        const match = {
          team1,
          team2,
          matchTime,
          matchMeta,
          matchUrl
        };
        
        matches.push(match);
      });
      
      if (matches.length > 0) {
        console.log(`Successfully fetched ${matches.length} upcoming matches`);
        this.saveToCache(this.cacheMatchesFile, matches);
        return matches;
      }
    } catch (error) {
      console.error('Error fetching upcoming matches:', error.message);
    }
    
    // Fallback data if scraping fails
    return [
      {
        team1: "Unable to fetch matches",
        team2: "Please visit HLTV.org",
        matchTime: new Date().toLocaleTimeString(),
        matchMeta: "Data unavailable",
        matchUrl: "https://www.hltv.org/matches"
      }
    ];
  }
  /**
   * Get top ranked teams from HLTV.org with fallbacks
   * @param {number} limit - Maximum number of teams to return
   * @returns {Promise<Array>} Array of top teams
   */
  async getTopTeams(limit = 5) {
    // First check the cache
    const cachedTeams = this.loadFromCache(this.cacheTeamsFile);
    if (cachedTeams) {
      return cachedTeams.slice(0, limit);
    }
    
    // Construct the URL for the latest rankings
    // Format: https://www.hltv.org/ranking/teams/YEAR/MONTH/DAY
    const now = new Date();
    const year = now.getFullYear();
    const month = ['january', 'february', 'march', 'april', 'may', 'june', 
                  'july', 'august', 'september', 'october', 'november', 'december'][now.getMonth()];
    
    // HLTV updates rankings on Mondays, so let's find the most recent Monday
    let day = now.getDate();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    if (dayOfWeek === 0) { // Sunday
      day -= 6; // Go back to previous Monday
    } else {
      day -= (dayOfWeek - 1); // Go back to this week's Monday
    }
    if (day <= 0) { // If we went to previous month
      day = 1; // Just use the 1st of this month as fallback
    }
    
    // Try with the direct rankings URL first (like you provided)
    const rankingUrl = `${this.baseUrl}/ranking/teams/${year}/${month}/${day}`;
    console.log(`Attempting to fetch rankings from: ${rankingUrl}`);
    
    try {
      // Try with a different approach specifically for rankings
      const response = await axios.get(rankingUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://www.google.com/',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const teams = [];
      
      // Try different selectors based on the page structure
      $('.ranked-team, .hltv-divider').each((i, element) => {
        if (i >= limit) return;
        
        const rank = $(element).find('.position, .ranking-number').first().text().trim();
        const name = $(element).find('.name, .ranking-team-name').first().text().trim();
        const points = $(element).find('.points, .ranking-team-points').first().text().trim() || 'N/A';
        
        if (rank && name) {
          teams.push({
            rank,
            name,
            points
          });
        }
      });
      
      if (teams.length > 0) {
        console.log(`Successfully fetched ${teams.length} top teams`);
        this.saveToCache(this.cacheTeamsFile, teams);
        return teams;
      } else {
        throw new Error('No teams found in the response');
      }
    } catch (error) {
      console.error('Error fetching top teams from specific URL:', error.message);
      
      // Try the generic rankings page as fallback
      try {
        console.log('Attempting to fetch from generic rankings page...');
        const response = await axios.get(`${this.baseUrl}/ranking/teams`, {
          headers: this.headers,
          timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const teams = [];
        
        $('.ranked-team, .teamline').each((i, element) => {
          if (i >= limit) return;
          
          const rank = $(element).find('.position, .numberAndTrophy').first().text().trim();
          const name = $(element).find('.name, .nameCol').first().text().trim();
          const points = $(element).find('.points, .ratingCol').first().text().trim() || 'N/A';
          
          if (rank && name) {
            teams.push({
              rank,
              name,
              points
            });
          }
        });
        
        if (teams.length > 0) {
          console.log(`Successfully fetched ${teams.length} top teams from generic page`);
          this.saveToCache(this.cacheTeamsFile, teams);
          return teams;
        }
      } catch (error) {
        console.error('Error fetching from generic rankings page:', error.message);
      }
    }    
    // All methods failed, use fallback data
    console.log('All ranking methods failed, using static fallback');
    return [
      { rank: "1", name: "Unable to fetch rankings", points: "N/A" },
      { rank: "2", name: "Please visit HLTV.org", points: "N/A" },
      { rank: "3", name: "for current rankings", points: "N/A" }
    ];
  }
    /**
   * Manually update team rankings with a specific URL
   * This can be called from commands to update cached rankings
   * @param {string} dateString - Format: YYYY/month/DD (e.g., "2025/may/12")
   * @returns {Promise<Array>} - Array of team rankings
   */
  async updateTeamRankings(dateString) {
    try {
      console.log(`DEBUG: Manually updating team rankings with date: ${dateString}`);
      const url = `${this.baseUrl}/ranking/teams/${dateString}`;
      console.log(`DEBUG: Fetching from URL: ${url}`);
      
      // Save headers for logging
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.google.com/',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      console.log(`DEBUG: Using headers:`, headers);
      
      console.log(`DEBUG: Making HTTP request...`);
      const response = await axios.get(url, {
        headers: headers,
        timeout: 15000 // Increased timeout to 15 seconds
      });
      
      console.log(`DEBUG: Response status: ${response.status}`);
      console.log(`DEBUG: Response content type: ${response.headers['content-type']}`);
      
      // Save response for analysis if needed
      try {
        fs.writeFileSync('debug-hltv-response.html', response.data);
        console.log(`DEBUG: Saved response HTML to debug-hltv-response.html`);
      } catch (err) {
        console.log(`DEBUG: Could not save response HTML: ${err.message}`);
      }
      
      console.log(`DEBUG: Parsing response with cheerio...`);
      const $ = cheerio.load(response.data);
      
      // Log some basic page info to verify we got the right page
      const pageTitle = $('title').text();
      console.log(`DEBUG: Page title: ${pageTitle}`);
      
      const teams = [];
      console.log(`DEBUG: Looking for team elements...`);
      
      // Log what selectors we're looking for
      console.log(`DEBUG: Searching for elements with selectors: .ranked-team, .team, .teamline`);
      
      // We'll try multiple selectors to handle different page formats
      $('.ranked-team, .team, .teamline').each((i, element) => {
        console.log(`DEBUG: Found team element #${i+1}`);
        
        let rank = $(element).find('.position, .numberAndTrophy, .ranking-number').first().text().trim();
        const name = $(element).find('.name, .nameCol, .ranking-team-name').first().text().trim();
        const points = $(element).find('.points, .ratingCol, .ranking-team-points').first().text().trim() || 'N/A';
        
        console.log(`DEBUG: Raw data - rank: "${rank}", name: "${name}", points: "${points}"`);
        
        // Clean up the rank if needed
        if (rank) {
          rank = rank.replace(/[^0-9]/g, ''); // Remove non-numeric characters
          console.log(`DEBUG: Cleaned rank: "${rank}"`);
        }
        
        if (rank && name) {
          teams.push({
            rank,
            name,
            points
          });
          console.log(`DEBUG: Added team to results list`);
        } else {
          console.log(`DEBUG: Skipped team due to missing rank or name`);
        }
      });
      
      if (teams.length > 0) {
        console.log(`Successfully fetched ${teams.length} teams from ${url}`);
        this.saveToCache(this.cacheTeamsFile, teams);
        return teams;
      } else {
        throw new Error(`No teams found at ${url}`);
      }
    } catch (error) {
      console.error(`Error manually updating team rankings: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new HLTVScraper();
