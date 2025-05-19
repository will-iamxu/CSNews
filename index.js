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

// Function to send news updates to Discord
async function sendNewsUpdates() {
  try {
    const channelId = process.env.CHANNEL_ID;
    const channel = await client.channels.fetch(channelId);
    
    if (!channel) {
      console.error(`Channel with ID ${channelId} not found`);
      return;
    }
    
    const articles = await scraper.getLatestNews();
    
    if (articles.length === 0) {
      console.log('No articles found');
      return;
    }
    
    // Filter to get only new articles we haven't posted yet
    const newArticles = articles.filter(article => 
      !lastPostedArticles.some(postedArticle => postedArticle.url === article.url)
    );
    
    if (newArticles.length === 0) {
      console.log('No new articles to post');
      return;
    }
    
    // Update lastPostedArticles with the new ones
    lastPostedArticles = [...lastPostedArticles, ...newArticles];
      // Keep only the most recent X articles in our memory
    if (lastPostedArticles.length > config.maxArticlesToKeep) {
      lastPostedArticles = lastPostedArticles.slice(lastPostedArticles.length - config.maxArticlesToKeep);
    }
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

client.once('ready', () => {
  if (config.logging.showStartupMessage) {
    console.log(`Logged in as ${client.user.tag}!`);
  }
    // Set custom status
  client.user.setActivity('for CS news', { type: 'Watching' });
  
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
  
  const { content } = message;
  
  // Handle commands
  if (content === config.commands.checkNews) {
    await message.channel.send('Checking for the latest CS news...');
    await sendNewsUpdates();
  } 
  else if (content === config.commands.matches) {
    await message.channel.send('Fetching upcoming CS matches...');
    await sendUpcomingMatches(message.channel);
  } 
  else if (content === config.commands.teams) {
    await message.channel.send('Fetching current CS team rankings...');
    await sendTopTeams(message.channel);
  }
  else if (content === '!help') {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('CS News Bot Commands')
      .setDescription('Here are the available commands:')
      .addFields(
        { name: config.commands.checkNews, value: 'Get the latest CS news from HLTV.org', inline: false },
        { name: config.commands.matches, value: 'Get upcoming CS matches', inline: false },
        { name: config.commands.teams, value: 'Get current CS team rankings', inline: false },
        { name: '!help', value: 'Show this help message', inline: false }
      )
      .setFooter({ text: 'CS News Discord Bot by HLTV.org' });
    
    await message.channel.send({ embeds: [embed] });
  }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN)
  .catch(error => {
    console.error('Error logging in to Discord:', error);
  });
