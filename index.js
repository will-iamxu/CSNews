require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const scraper = require('./scraper');

// Load optional config file
let config = {
  embedColor: '#0099ff',
  footerText: 'HLTV.org CS News Bot',
  maxArticlesToKeep: 20,
  delayBetweenMessages: 1000,
  commands: {
    checkNews: '!csnews',
    matches: '!csmatches',
    teams: '!csteams'
  },
  logging: {
    showStartupMessage: true,
    showUpdateChecks: true
  }
};

// Try to load the config file if it exists
try {
  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    const loadedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config = { ...config, ...loadedConfig };
    console.log('Loaded custom configuration');
  }
} catch (error) {
  console.error('Error loading config file:', error);
}

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Global variable to store the last articles we posted
let lastPostedArticles = [];

// Function to load previously posted articles from file
function loadPostedArticles() {
  try {
    const postedArticlesPath = path.join(__dirname, 'cache', 'posted_articles.json');
    if (fs.existsSync(postedArticlesPath)) {
      const data = JSON.parse(fs.readFileSync(postedArticlesPath, 'utf8'));
      lastPostedArticles = data.articles || [];
      console.log(`Loaded ${lastPostedArticles.length} previously posted articles from file`);
      
      // If the file was just created and is empty, initialize it properly
      if (lastPostedArticles.length === 0) {
        console.log('No previous articles found, initializing with empty array');
      }
    } else {
      console.log('No posted articles file found, will create one when articles are posted');
    }
  } catch (error) {
    console.error('Error loading posted articles from file:', error);
    // Initialize with empty array if there's an error
    lastPostedArticles = [];
  }
}

// Function to save posted articles to file
function savePostedArticles() {
  try {
    const postedArticlesPath = path.join(__dirname, 'cache', 'posted_articles.json');
    
    // Implement a cleanup to prevent the file from growing too large over time
    // Keep only the most recent X articles in the file
    if (lastPostedArticles.length > config.maxArticlesToKeep * 2) {
      lastPostedArticles = lastPostedArticles.slice(lastPostedArticles.length - config.maxArticlesToKeep * 2);
      console.log(`Pruned posted articles list to ${lastPostedArticles.length} entries`);
    }
    
    const data = {
      articles: lastPostedArticles
    };
    
    fs.writeFileSync(postedArticlesPath, JSON.stringify(data, null, 2));
    console.log(`Saved ${lastPostedArticles.length} posted articles to file`);
  } catch (error) {
    console.error('Error saving posted articles to file:', error);
  }
}

// Function to send news updates to Discord
async function sendNewsUpdates() {
  try {
    const channelId = process.env.CHANNEL_ID;
    
    // Check if channel ID is provided
    if (!channelId) {
      console.error('No channel ID provided in .env file');
      return;
    }
    
    let channel;
    try {
      channel = await client.channels.fetch(channelId);
    } catch (error) {
      if (error.code === 50001) {
        console.error(`Missing access to channel ${channelId}. Make sure the bot has proper permissions.`);
        console.error('See bot_permissions_guide.md for help with setting up permissions.');
      } else {
        console.error(`Error fetching channel: ${error.message}`);
      }
      return;
    }
    
    if (!channel) {
      console.error(`Channel with ID ${channelId} not found`);
      return;
    }
    
    // Check if the channel is a text channel
    if (!channel.isTextBased()) {
      console.error(`Channel with ID ${channelId} is not a text channel`);
      return;
    }
      const articles = await scraper.getLatestNews();
    
    if (articles.length === 0) {
      console.log('No articles found');
      return;
    }
    
    // Filter to get only new articles we haven't posted yet
    // We also need to handle cached articles specially to prevent reposting after restart
    const newArticles = articles.filter(article => {
      // If the article is from cache and the bot just restarted, 
      // we want to make sure it hasn't been posted before
      if (article.fromCache) {
        return !lastPostedArticles.some(postedArticle => postedArticle.url === article.url);
      }
      // For fresh articles (not from cache), check as usual
      return !lastPostedArticles.some(postedArticle => postedArticle.url === article.url);
    });
    
    if (newArticles.length === 0) {
      console.log('No new articles to post');
      return;
    }    // Update lastPostedArticles with the new ones
    // Remove the fromCache flag when storing in lastPostedArticles
    const cleanNewArticles = newArticles.map(article => {
      const { fromCache, ...rest } = article;
      return rest;
    });
    
    lastPostedArticles = [...lastPostedArticles, ...cleanNewArticles];
    // Keep only the most recent X articles in our memory
    if (lastPostedArticles.length > config.maxArticlesToKeep) {
      lastPostedArticles = lastPostedArticles.slice(lastPostedArticles.length - config.maxArticlesToKeep);
    }
    // Save posted articles to file so they persist across restarts
    savePostedArticles();
      // Send new articles to Discord
    if (config.logging.showUpdateChecks) {
      console.log(`Sending ${newArticles.length} new articles to Discord`);
    }
    
    for (const article of newArticles) {
      const embed = new EmbedBuilder()
        .setColor(article.type === 'featured' ? '#FF4500' : config.embedColor)
        .setTitle(article.title)
        .setURL(article.url)
        .setDescription('Click the title to read the full article')
        .setTimestamp()
        .setFooter({ text: config.footerText });
      
      // Add image for featured articles if available
      if (article.image) {
        embed.setImage(article.image);
      }
      
      // Add timestamp if available
      if (article.time) {
        embed.addFields({ name: 'Published', value: article.time, inline: true });
      }
      
      await channel.send({ embeds: [embed] });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, config.delayBetweenMessages));
    }
    
  } catch (error) {
    console.error('Error sending news updates:', error);
  }
}

// Function to send upcoming matches to Discord
async function sendUpcomingMatches(channel) {
  try {
    const matches = await scraper.getUpcomingMatches(5);
    
    if (matches.length === 0) {
      return channel.send('No upcoming matches found on HLTV.org');
    }
    
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Upcoming CS Matches')
      .setURL('https://www.hltv.org/matches')
      .setDescription('Here are the upcoming Counter-Strike matches:')
      .setTimestamp()
      .setFooter({ text: 'Data from HLTV.org' });
    
    matches.forEach((match, index) => {
      embed.addFields({ 
        name: `Match ${index + 1}: ${match.team1} vs ${match.team2}`,
        value: `⏰ ${match.matchTime}\n🏆 ${match.matchMeta}\n🔗 [Match Details](${match.matchUrl})`
      });
    });
    
    return channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending upcoming matches:', error);
    return channel.send('Failed to retrieve upcoming matches. Please try again later.');
  }
}

// Function to send top teams to Discord
async function sendTopTeams(channel) {
  try {
    const teams = await scraper.getTopTeams(10);
    
    if (teams.length === 0) {
      return channel.send('No team ranking data found on HLTV.org');
    }
    
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('CS Team Rankings')
      .setURL('https://www.hltv.org/ranking/teams')
      .setDescription('Current HLTV.org team rankings:')
      .setTimestamp()
      .setFooter({ text: 'Data from HLTV.org' });
    
    teams.forEach(team => {
      embed.addFields({ 
        name: `#${team.rank} ${team.name}`, 
        value: `Points: ${team.points}`,
        inline: true
      });
    });
    
    return channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending team rankings:', error);
    return channel.send('Failed to retrieve team rankings. Please try again later.');
  }
}

// Function to check if the cache is too old and needs resetting
function checkCacheAge() {
  try {
    const cacheFile = path.join(__dirname, 'cache', 'news_cache.json');
    if (!fs.existsSync(cacheFile)) {
      return; // No cache to check
    }
    
    const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    const now = new Date().getTime();
    const cacheTime = cacheData.timestamp;
    
    // If cache is older than 24 hours, consider it stale for startup purposes
    const cacheAgeHours = (now - cacheTime) / (1000 * 60 * 60);
    if (cacheAgeHours > 24) {
      console.log(`Cache is ${cacheAgeHours.toFixed(2)} hours old, which is stale. Will fetch fresh data.`);
      // Delete the cache file to force a fresh fetch
      fs.unlinkSync(cacheFile);
      console.log('Deleted stale cache file to force fresh data fetch');
    } else {
      console.log(`Cache is ${cacheAgeHours.toFixed(2)} hours old, which is considered recent.`);
    }
  } catch (error) {
    console.error('Error checking cache age:', error);
  }
}

client.once('ready', () => {
  if (config.logging.showStartupMessage) {
    console.log(`Logged in as ${client.user.tag}!`);
  }
  
  // Set custom status
  client.user.setActivity('for CS news', { type: 'Watching' });
  
  // Load previously posted articles to prevent reposting
  loadPostedArticles();
  
  // Check cache age on startup
  checkCacheAge();
  
  // Immediately check for news
  sendNewsUpdates();
  
  // Set up interval for checking news
  const updateIntervalMinutes = process.env.UPDATE_INTERVAL || 60;
  const updateIntervalMs = updateIntervalMinutes * 60 * 1000;
  
  if (config.logging.showStartupMessage) {
    console.log(`Setting up news check interval: ${updateIntervalMinutes} minutes`);
  }
  setInterval(sendNewsUpdates, updateIntervalMs);
});

// Command handler
client.on('messageCreate', async message => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  // Without MessageContent intent, we can only respond to mentions
  // or use slash commands (which would require additional setup)
  if (message.mentions.has(client.user)) {
    // Simple help message when mentioned
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('CS News Bot Commands')
      .setDescription('Here are the available commands:')
      .addFields(
        { name: config.commands.checkNews, value: 'Get the latest CS news from HLTV.org', inline: false },
        { name: config.commands.matches, value: 'Get upcoming CS matches', inline: false },
        { name: config.commands.teams, value: 'Get current CS team rankings', inline: false },
        { name: '!csreset', value: 'Admin only: Reset article history to prevent duplicates', inline: false },
        { name: '!help', value: 'Show this help message', inline: false }
      )
      .setFooter({ text: 'CS News Discord Bot' });
    
    await message.channel.send({ embeds: [embed] });
    return;
  }
  
  // Commands handling code for when MessageContent intent is enabled
  const { content } = message;
  
  // Handle commands
  if (content === config.commands.checkNews) {
    await message.channel.send('Checking for the latest CS news...');
    await sendNewsUpdates();  } 
  else if (content === config.commands.matches) {
    await message.channel.send('Fetching upcoming CS matches...');
    await sendUpcomingMatches(message.channel);
  }
  else if (content === config.commands.teams) {
    await message.channel.send('Fetching current CS team rankings...');
    await sendTopTeams(message.channel);
  }
  else if (content === '!csreset') {
    // Add a command to clear the posted articles cache
    const userIsAdmin = message.member && message.member.permissions.has('ADMINISTRATOR');
    if (userIsAdmin) {
      lastPostedArticles = [];
      savePostedArticles();
      await message.channel.send('✅ Reset the article history. New articles will be posted on the next check.');
      
      // Also reset the news cache if it exists
      try {
        const newsCache = path.join(__dirname, 'cache', 'news_cache.json');
        if (fs.existsSync(newsCache)) {
          fs.unlinkSync(newsCache);
          await message.channel.send('✅ Cleared the news cache. Fresh data will be fetched.');
        }
      } catch (err) {
        console.error('Error clearing news cache:', err);
      }
    } else {
      await message.channel.send('❌ Only administrators can reset the article history.');
    }
  }
  else if (content.startsWith('!csrankings ')) {
    // Extract date from command: !csrankings 2025/may/12
    const dateString = content.replace('!csrankings ', '').trim();
    if (/^\d{4}\/[a-z]+\/\d{1,2}$/.test(dateString)) {
      await message.channel.send(`Fetching CS team rankings for specific date: ${dateString}...`);
      try {
        const teams = await scraper.updateTeamRankings(dateString);
        
        const embed = new EmbedBuilder()
          .setColor(config.embedColor)
          .setTitle(`CS Team Rankings - ${dateString}`)
          .setURL(`https://www.hltv.org/ranking/teams/${dateString}`)
          .setDescription(`HLTV.org team rankings for ${dateString}:`)
          .setTimestamp()
          .setFooter({ text: 'Data from HLTV.org' });
        
        teams.slice(0, 10).forEach(team => {
          embed.addFields({ 
            name: `#${team.rank} ${team.name}`, 
            value: `Points: ${team.points}`,
            inline: true
          });
        });
        
        await message.channel.send({ embeds: [embed] });
      } catch (error) {
        await message.channel.send(`Error fetching rankings for ${dateString}. Please check the date format and try again.`);
      }
    } else {
      await message.channel.send('Invalid date format. Please use format: `!csrankings YYYY/month/DD` (e.g., `!csrankings 2025/may/12`)');
    }
  }  else if (content === '!help') {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('CS News Bot Commands')
      .setDescription('Here are the available commands:')
      .addFields(
        { name: config.commands.checkNews, value: 'Get the latest CS news from HLTV.org', inline: false },
        { name: config.commands.matches, value: 'Get upcoming CS matches', inline: false },
        { name: config.commands.teams, value: 'Get current CS team rankings', inline: false },
        { name: '!csreset', value: 'Admin only: Reset article history to prevent duplicates', inline: false },  
        { name: '!help', value: 'Show this help message', inline: false }
      )
      .setFooter({ text: 'CS News Discord Bot' });
    
    await message.channel.send({ embeds: [embed] });
  }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN)
  .catch(error => {
    console.error('Error logging in to Discord:', error);
  });
