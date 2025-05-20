/**
 * Cookie jar implementation for managing browser-like cookie behavior
 */
class CookieJar {
  constructor() {
    this.cookies = {};
    this.domains = new Set();
  }
  
  /**
   * Parse cookies from Set-Cookie headers
   * @param {string} setCookieHeader - Set-Cookie header value
   * @param {string} domain - Domain the cookie came from
   * @returns {Object} - Parsed cookie object
   */
  parseCookie(setCookieHeader, domain) {
    const cookie = {
      value: '',
      domain: domain,
      path: '/',
      expires: null,
      httpOnly: false,
      secure: false
    };
    
    const parts = setCookieHeader.split(';').map(part => part.trim());
    
    // Get the name and value from the first part
    const nameValue = parts.shift().split('=');
    const name = nameValue.shift();
    cookie.name = name;
    cookie.value = nameValue.join('=');
    
    // Parse the rest of the cookie attributes
    for (const part of parts) {
      const [attrName, ...attrValue] = part.split('=');
      const attrValueStr = attrValue.join('=');
      
      switch(attrName.toLowerCase()) {
        case 'domain':
          cookie.domain = attrValueStr || domain;
          break;
        case 'path':
          cookie.path = attrValueStr || '/';
          break;
        case 'expires':
          try {
            cookie.expires = new Date(attrValueStr);
          } catch(e) {
            // Invalid date format, ignore
          }
          break;
        case 'max-age':
          const maxAge = parseInt(attrValueStr, 10);
          if (!isNaN(maxAge)) {
            cookie.expires = new Date(Date.now() + maxAge * 1000);
          }
          break;
        case 'secure':
          cookie.secure = true;
          break;
        case 'httponly':
          cookie.httpOnly = true;
          break;
        case 'samesite':
          cookie.sameSite = attrValueStr.toLowerCase();
          break;
      }
    }
    
    return cookie;
  }
  
  /**
   * Add cookies from response headers
   * @param {Object} headers - Response headers
   * @param {string} domain - Domain the cookies came from
   */
  addFromHeaders(headers, domain) {
    if (!headers) return;
    
    this.domains.add(domain);
    
    // Handle Set-Cookie headers (can be a string or an array)
    const setCookieHeaders = headers['set-cookie'] || [];
    const cookieList = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    
    for (const cookieHeader of cookieList) {
      if (!cookieHeader) continue;
      
      const cookie = this.parseCookie(cookieHeader, domain);
      this.setCookie(cookie);
    }
  }
  
  /**
   * Set a cookie in the jar
   * @param {Object} cookie - Cookie object
   */
  setCookie(cookie) {
    // Remove domain cookies that have the same name, path
    const domainKey = cookie.domain;
    
    if (!this.cookies[domainKey]) {
      this.cookies[domainKey] = [];
    }
    
    // Replace existing cookie if it exists
    const index = this.cookies[domainKey].findIndex(
      c => c.name === cookie.name && c.path === cookie.path
    );
    
    if (index !== -1) {
      this.cookies[domainKey][index] = cookie;
    } else {
      this.cookies[domainKey].push(cookie);
    }
  }
  
  /**
   * Get cookies as a string for a specific domain
   * @param {string} url - The URL to get cookies for
   * @returns {string} - Cookie header string
   */
  getCookieString(url) {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const path = parsedUrl.pathname || '/';
    const secure = parsedUrl.protocol === 'https:';
    
    const cookies = this.getMatchingCookies(domain, path, secure);
    
    return cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
  }
  
  /**
   * Get matching cookies for a domain, path and security setting
   * @param {string} domain - Domain to match
   * @param {string} path - Path to match
   * @param {boolean} secure - Whether the connection is secure
   * @returns {Array} - Matching cookies
   */
  getMatchingCookies(domain, path, secure) {
    const now = new Date();
    const cookies = [];
    
    // Match cookies from exact domain and parent domains
    const domainParts = domain.split('.');
    
    for (let i = 0; i < domainParts.length - 1; i++) {
      const testDomain = domainParts.slice(i).join('.');
      const testDomainWithDot = '.' + testDomain;
      
      // Check cookies for this domain
      for (const cookieDomain of [testDomain, testDomainWithDot]) {
        if (!this.cookies[cookieDomain]) continue;
        
        // Filter cookies by path, expiry, and security
        for (const cookie of this.cookies[cookieDomain]) {
          // Skip expired cookies
          if (cookie.expires && cookie.expires < now) continue;
          
          // Skip secure cookies on non-secure connections
          if (cookie.secure && !secure) continue;
          
          // Check if the cookie path matches the request path
          if (!path.startsWith(cookie.path)) continue;
          
          cookies.push(cookie);
        }
      }
    }
    
    return cookies;
  }
  
  /**
   * Clean expired cookies from the jar
   */
  cleanExpiredCookies() {
    const now = new Date();
    
    for (const domain in this.cookies) {
      this.cookies[domain] = this.cookies[domain].filter(cookie => 
        !cookie.expires || cookie.expires >= now
      );
      
      // Remove empty domain entries
      if (this.cookies[domain].length === 0) {
        delete this.cookies[domain];
        this.domains.delete(domain);
      }
    }
  }
  
  /**
   * Get all cookie domain names
   * @returns {Array} - Array of domain names
   */
  getDomains() {
    return [...this.domains];
  }
  
  /**
   * Get cookies for a specific domain
   * @param {string} domain - Domain to get cookies for
   * @returns {Array} - Cookies for the domain
   */
  getDomainCookies(domain) {
    return this.cookies[domain] || [];
  }
}

module.exports = CookieJar;
