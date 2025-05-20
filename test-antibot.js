// test-antibot.js
// Test the anti-bot detection avoidance system

const scraper = require('./scraper');

// Flag to enable detailed logging
const VERBOSE = true;

// Test different browser sessions
async function testSessionRotation() {
  console.log('\n=== Testing Session Rotation ===');
  
  // Create multiple sessions
  const session1Id = 'test_session_1';
  const session2Id = 'test_session_2';
  
  // Get sessions and log info
  const session1 = scraper.getSession(session1Id, true);
  const session2 = scraper.getSession(session2Id, true);
  
  console.log('Session 1 Info:', session1.getSessionInfo());
  console.log('Session 2 Info:', session2.getSessionInfo());
  
  // Test if sessions have different fingerprints
  const differentUserAgent = session1.profile.userAgent !== session2.profile.userAgent;
  console.log(`Sessions have different User-Agents: ${differentUserAgent ? 'YES' : 'NO'}`);
  
  // Test cookie persistence
  console.log('\nTesting cookie persistence...');
  try {
    // Make first request with session 1
    const response1 = await scraper.makeRequest('https://httpbin.org/cookies/set?name=testcookie&value=123', {
      sessionId: session1Id
    });
    
    // Check if cookie was set
    const response2 = await scraper.makeRequest('https://httpbin.org/cookies', {
      sessionId: session1Id
    });
    
    // Log cookie info
    console.log('Session cookies after requests:');
    if (VERBOSE && response2.data && response2.data.cookies) {
      console.log(response2.data.cookies);
    }
    
    const cookieWasSet = response2.data && 
                        response2.data.cookies && 
                        response2.data.cookies.name === 'testcookie';
                        
    console.log(`Cookie persistence working: ${cookieWasSet ? 'YES' : 'NO'}`);
  } catch (error) {
    console.error('Error testing cookie persistence:', error.message);
  }
}

// Test rate limiting
async function testRateLimiting() {
  console.log('\n=== Testing Rate Limiting ===');
  
  const startTime = Date.now();
  
  // Make several requests in quick succession
  try {
    console.log('Making 6 requests in quick succession...');
    const urls = [
      'https://httpbin.org/get?param=1',
      'https://httpbin.org/get?param=2',
      'https://httpbin.org/get?param=3',
      'https://httpbin.org/get?param=4',
      'https://httpbin.org/get?param=5',
      'https://httpbin.org/get?param=6'
    ];
    
    const promises = urls.map(url => scraper.makeRequest(url));
    await Promise.all(promises);
    
    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`Total time for all requests: ${totalTime.toFixed(2)} seconds`);
    console.log(`Rate limiting appears to be working: ${totalTime > 60 ? 'YES' : 'NO'}`);
  } catch (error) {
    console.error('Error during rate limit testing:', error.message);
  }
}

// Test HLTV.org access with different profiles
async function testHltvAccess() {
  console.log('\n=== Testing HLTV.org Access ===');
  
  try {
    // Try to access HLTV news page with a standard profile
    const standardSession = 'test_standard_session';
    console.log('Attempting to access HLTV.org with standard profile...');
    
    let success = false;
    try {
      const response = await scraper.makeRequest(`${scraper.baseUrl}/news`, {
        sessionId: standardSession,
        timeout: 15000
      });
      
      success = response.status === 200;
      console.log(`Access with standard profile: ${success ? 'SUCCESS' : 'FAILED'}`);
      
      if (success) {
        console.log('Standard profile headers used:');
        const session = scraper.getSession(standardSession);
        console.log(`User-Agent: ${session.profile.userAgent}`);
        
        // Check if we got actual content (not a bot detection page)
        const hasRealContent = response.data && 
                               (response.data.includes('<title>HLTV.org') || 
                                response.data.includes('<div class="newslist">'));
                                
        console.log(`Got real HLTV content: ${hasRealContent ? 'YES' : 'NO'}`);
      }
    } catch (error) {
      console.error('Error with standard profile access:', error.message);
    }
    
    // If standard profile failed, try with a crawler profile for sitemap
    if (!success) {
      console.log('\nAttempting to access HLTV sitemap with crawler profile...');
      try {
        const response = await scraper.makeRequest(scraper.newsSitemap, {
          contentType: 'sitemap',
          timeout: 15000
        });
        
        success = response.status === 200 && response.data;
        console.log(`Access with crawler profile: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        if (success && VERBOSE) {
          console.log('First 200 chars of response:');
          console.log(response.data.substring(0, 200));
        }
      } catch (error) {
        console.error('Error with crawler profile access:', error.message);
      }
    }
  } catch (error) {
    console.error('Error during HLTV access test:', error.message);
  }
}

// Test the HLTV news fetching with our anti-bot system
async function testNewsFetching() {
  console.log('\n=== Testing News Fetching ===');
  
  try {
    console.log('Fetching latest news...');
    const news = await scraper.getLatestNews();
    
    console.log(`Retrieved ${news.length} news articles`);
    if (news.length > 0) {
      console.log('First 3 articles:');
      news.slice(0, 3).forEach((article, i) => {
        console.log(`${i+1}. ${article.title}`);
        console.log(`   URL: ${article.url}`);
        console.log(`   Time: ${article.time}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error during news fetching test:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('=== TESTING ANTI-BOT DETECTION SYSTEM ===');
  console.log('Starting tests at:', new Date().toLocaleString());
  
  try {
    // Test session functionality
    await testSessionRotation();
    
    // Test rate limiting
    await testRateLimiting();
    
    // Test actual HLTV access
    await testHltvAccess();
    
    // Test the full news fetching pipeline
    await testNewsFetching();
    
    console.log('\n=== ALL TESTS COMPLETED ===');
    console.log('Tests finished at:', new Date().toLocaleString());
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

// Run all tests
runAllTests().catch(console.error);
