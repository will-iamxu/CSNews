/**
 * Browser session management module
 * 
 * Handles multiple sessions with different browser profiles and cookie jars
 */
const CookieJar = require('./cookie-jar');
const { browserProfiles, crawlerProfiles, referrers } = require('./browser-profiles');
const { 
  getTLSFingerprint, 
  getRandomScreenProfile, 
  getWebGLProfile, 
  getRandomDelay,
  getRandomProxy,
  behavioralPatterns
} = require('./enhanced-fingerprints');

class BrowserSession {
  constructor(options = {}) {
    // Load browser profile
    this.profile = options.profile || this.getRandomProfile('browser');
    
    // Generate session properties
    this.sessionId = Math.random().toString(36).substring(2, 15);
    this.cookies = new CookieJar();
    this.headers = this.createSessionHeaders();
    
    // Add TLS fingerprint
    this.tlsFingerprint = getTLSFingerprint(this.profile.name.split(' ')[0]);
    
    // Add screen and device information
    const isMobile = this.profile.name.toLowerCase().includes('mobile') || 
                    (this.profile.secChUaMobile === '?1');
    const deviceType = isMobile ? 'mobile' : 'desktop';
    this.screen = getRandomScreenProfile(deviceType);
    
    // Add WebGL profile
    const gpuVendors = ['intel', 'nvidia', 'amd'];
    const randomVendor = gpuVendors[Math.floor(Math.random() * gpuVendors.length)];
    this.webgl = getWebGLProfile(randomVendor);
    
    // Navigation behavior
    const navPatterns = behavioralPatterns.navigationPatterns;
    const totalWeight = navPatterns.reduce((sum, pattern) => sum + pattern.weight, 0);
    const randomValue = Math.random() * totalWeight;
    
    let weightSum = 0;
    for (const pattern of navPatterns) {
      weightSum += pattern.weight;
      if (randomValue <= weightSum) {
        this.navigationPattern = pattern.name;
        break;
      }
    }
    
    // Session behavior
    const sessionBehaviors = behavioralPatterns.sessionBehaviors;
    const behaviorWeight = sessionBehaviors.reduce((sum, behavior) => sum + behavior.weight, 0);
    const randomBehavior = Math.random() * behaviorWeight;
    
    weightSum = 0;
    for (const behavior of sessionBehaviors) {
      weightSum += behavior.weight;
      if (randomBehavior <= weightSum) {
        this.sessionBehavior = behavior;
        break;
      }
    }
    
    // Visit history
    this.visitHistory = [];
    this.visitCount = 0;
    this.sessionStart = Date.now();
    this.lastVisitTime = this.sessionStart;
    
    // Proxy setup if enabled
    if (options.useProxy) {
      this.proxy = getRandomProxy(options.proxyType || 'standard');
      this.proxyType = options.proxyType || 'standard';
    }
    
    // Request timing
    this.lastRequestTime = 0;
  }
  
  /**
   * Get random profile by type
   * @param {string} type - Profile type ('browser' or 'crawler')
   * @param {string} contentType - Content type for crawler profiles
   * @returns {Object} - Selected profile
   */
  getRandomProfile(type, contentType = null) {
    if (type === 'crawler' && contentType) {
      const validProfiles = crawlerProfiles.filter(profile => 
        profile.forTypes && profile.forTypes.includes(contentType)
      );
      
      if (validProfiles.length > 0) {
        return validProfiles[Math.floor(Math.random() * validProfiles.length)];
      }
      
      // Fallback to first crawler if no matching content type
      return crawlerProfiles[0];
    }
    
    // For browser profiles, use weighted selection
    const profiles = type === 'crawler' ? crawlerProfiles : browserProfiles;
    const totalWeight = profiles.reduce((sum, profile) => sum + (profile.weight || 1), 0);
    const randomValue = Math.random() * totalWeight;
    
    let weightSum = 0;
    for (const profile of profiles) {
      weightSum += profile.weight || 1;
      if (randomValue <= weightSum) {
        return profile;
      }
    }
    
    // Fallback to first profile
    return profiles[0];
  }
  
  /**
   * Create headers for this session
   * @returns {Object} - Headers object
   */
  createSessionHeaders() {
    const headers = {
      'User-Agent': this.profile.userAgent,
      'Accept': this.profile.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': this.profile.acceptLanguage || 'en-US,en;q=0.9',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'Referer': referrers[Math.floor(Math.random() * referrers.length)],
      'Upgrade-Insecure-Requests': '1'
    };
    
    // Add Chrome/Edge specific headers if it's that type of browser
    if (this.profile.secChUa) {
      headers['sec-ch-ua'] = this.profile.secChUa;
      headers['sec-ch-ua-platform'] = this.profile.secChUaPlatform || '"Windows"';
      headers['sec-ch-ua-mobile'] = this.profile.secChUaMobile || '?0';
    }
    
    // Add Firefox specific headers
    if (this.profile.secFetchDest) {
      headers['Sec-Fetch-Dest'] = this.profile.secFetchDest;
      headers['Sec-Fetch-Mode'] = this.profile.secFetchMode;
      headers['Sec-Fetch-Site'] = this.profile.secFetchSite;
      if (this.profile.secFetchUser) headers['Sec-Fetch-User'] = this.profile.secFetchUser;
    }
    
    return headers;
  }
  
  /**
   * Update headers for a specific request
   * @param {string} url - URL to request
   * @param {Object} options - Additional options
   * @returns {Object} - Updated headers
   */
  prepareRequestHeaders(url, options = {}) {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    
    // Clone base headers
    const headers = { ...this.headers };
    
    // Add/modify the referer based on history
    if (this.visitHistory.length > 0 && Math.random() < 0.8) { // 80% chance to use history-based referer
      const lastVisit = this.visitHistory[this.visitHistory.length - 1];
      headers['Referer'] = lastVisit;
    } else if (options.referer) {
      headers['Referer'] = options.referer;
    }
    
    // Add cookies if we have them for this domain
    const cookieString = this.cookies.getCookieString(url);
    if (cookieString) {
      headers['Cookie'] = cookieString;
    }
    
    // Set origin for certain requests
    if (options.includeOrigin || parsedUrl.pathname.toLowerCase().includes('api')) {
      headers['Origin'] = `${parsedUrl.protocol}//${parsedUrl.host}`;
    }
    
    return headers;
  }
  
  /**
   * Calculate wait time based on session behavior
   * @param {string} actionType - Type of action
   * @returns {number} - Wait time in ms
   */
  calculateWaitTime(actionType = 'pageLoad') {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // If we've already waited enough naturally, don't wait more
    if (timeSinceLastRequest > 2000) {
      return 0;
    }
    
    return getRandomDelay(actionType);
  }
  
  /**
   * Record a visit to a URL
   * @param {string} url - The URL visited
   * @param {Object} responseHeaders - Response headers from the visit
   */
  recordVisit(url, responseHeaders) {
    this.visitHistory.push(url);
    this.visitCount++;
    this.lastVisitTime = Date.now();
    this.lastRequestTime = Date.now();
    
    // Extract domain for cookie management
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    
    // Store cookies from the response
    if (responseHeaders) {
      this.cookies.addFromHeaders(responseHeaders, domain);
    }
    
    // Occasionally clean expired cookies (10% chance per request)
    if (Math.random() < 0.1) {
      this.cookies.cleanExpiredCookies();
    }
  }
  
  /**
   * Check if session should be rotated based on behavior
   * @returns {boolean} - Whether session should be rotated
   */
  shouldRotateSession() {
    const sessionDuration = Date.now() - this.sessionStart;
    const behavior = this.sessionBehavior;
    
    // Check if we've exceeded the visit count for this session type
    if (this.visitCount >= behavior.pageViews.max) {
      return true;
    }
    
    // Check if we've exceeded the session duration
    if (sessionDuration >= behavior.sessionDuration.max) {
      return true;
    }
    
    // 5% random chance of rotation anyway for unpredictability
    return Math.random() < 0.05;
  }
  
  /**
   * Get proxy configuration for this session
   * @returns {Object|null} - Proxy configuration object or null if not using proxy
   */
  getProxyConfig() {
    if (!this.proxy) return null;
    
    const { host, port, username, password } = this.proxy;
    return {
      host,
      port,
      auth: username && password ? { username, password } : undefined
    };
  }
  
  /**
   * Get session information for debugging/logging
   * @returns {Object} - Session info
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      browser: this.profile.name,
      userAgent: this.profile.userAgent,
      visitCount: this.visitCount,
      sessionDuration: Date.now() - this.sessionStart,
      cookieDomains: this.cookies.getDomains(),
      navigationPattern: this.navigationPattern,
      proxy: this.proxy ? `${this.proxyType} (${this.proxy.host})` : 'none',
      screen: this.screen
    };
  }
}

module.exports = BrowserSession;
