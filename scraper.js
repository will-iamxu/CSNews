const axios = require('axios');
const cheerio = require('cheerio');

/**
 * HLTV.org scraper module
 * 
 * This module handles all the scraping operations for HLTV.org
 */
class HLTVScraper {
  constructor() {
    this.baseUrl = 'https://www.hltv.org';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  /**
   * Get the latest news articles from HLTV.org
   * @returns {Promise<Array>} Array of news articles
   */
  async getLatestNews() {
    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      const $ = cheerio.load(response.data);
      const articles = [];
      
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
      
      return articles;
    } catch (error) {
      console.error('Error scraping HLTV news:', error);
      return [];
    }
  }

  /**
   * Get upcoming matches from HLTV.org
   * @returns {Promise<Array>} Array of upcoming matches
   */
  async getUpcomingMatches(limit = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/matches`, {
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
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
      
      return matches;
    } catch (error) {
      console.error('Error scraping HLTV matches:', error);
      return [];
    }
  }

  /**
   * Get top ranked teams from HLTV.org
   * @returns {Promise<Array>} Array of top teams
   */
  async getTopTeams(limit = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/ranking/teams`, {
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      const $ = cheerio.load(response.data);
      const teams = [];
      
      $('.ranked-team').each((i, element) => {
        if (i >= limit) return;
        
        const rank = $(element).find('.position').text().trim();
        const name = $(element).find('.name').text().trim();
        const points = $(element).find('.points').text().trim();
        
        teams.push({
          rank,
          name,
          points
        });
      });
      
      return teams;
    } catch (error) {
      console.error('Error scraping HLTV top teams:', error);
      return [];
    }
  }
}

module.exports = new HLTVScraper();
