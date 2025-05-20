/**
 * Advanced browser fingerprinting data
 * 
 * This module provides realistic browser fingerprinting data including:
 * - TLS/SSL fingerprints
 * - WebGL rendering information
 * - Screen resolution profiles
 * - WebRTC handling behavior
 * - Cookie jar simulation
 */

/**
 * TLS fingerprint data for different browsers
 * Based on JA3 fingerprint patterns
 */
const tlsFingerprints = {
  'Chrome': [
    // Chrome on Windows
    {
      ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513-21,29-23-24,0',
      ja3_hash: 'cd08e31494f9531f560d64c695473da9', // Example hash
      tls_version: '1.2',
      cipher_suite_order: [
        'ECDHE-ECDSA-AES128-GCM-SHA256', 'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384', 'ECDHE-RSA-AES256-GCM-SHA384'
      ]
    },
    // Chrome on macOS
    {
      ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0',
      ja3_hash: '2a1eb1dc58298222bda4e6755baf4ba1', // Example hash
      tls_version: '1.2',
      cipher_suite_order: [
        'ECDHE-ECDSA-AES128-GCM-SHA256', 'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384', 'ECDHE-RSA-AES256-GCM-SHA384'
      ]
    }
  ],
  'Firefox': [
    // Firefox on Windows
    {
      ja3: '771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-28-51-45-43-27,29-23-24-25-256-257,0',
      ja3_hash: 'fecf01588d119c4bfb2f891066553c25', // Example hash
      tls_version: '1.2',
      cipher_suite_order: [
        'ECDHE-ECDSA-AES256-GCM-SHA384', 'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-AES128-GCM-SHA256', 'ECDHE-RSA-AES128-GCM-SHA256'
      ]
    },
    // Firefox on macOS
    {
      ja3: '771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-28-51-45-43-27,29-23-24-25-256-257,0',
      ja3_hash: '1c1a57365c8f985432f52fd89067f98f', // Example hash
      tls_version: '1.2',
      cipher_suite_order: [
        'ECDHE-ECDSA-AES256-GCM-SHA384', 'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-AES128-GCM-SHA256', 'ECDHE-RSA-AES128-GCM-SHA256'
      ]
    }
  ],
  'Safari': [
    // Safari on macOS/iOS
    {
      ja3: '771,4865-4866-4867-49195-49196-52393-49199-49200-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-28-51-45-43,29-23-24,0',
      ja3_hash: '4364ecf023b4d78b10f485d6f6bc52d3', // Example hash
      tls_version: '1.2',
      cipher_suite_order: [
        'ECDHE-ECDSA-AES256-GCM-SHA384', 'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-AES128-GCM-SHA256', 'ECDHE-RSA-AES128-GCM-SHA256'
      ]
    }
  ],
  'Edge': [
    // Edge on Windows
    {
      ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0',
      ja3_hash: '27f3738d45ca05015a7c4057a3095b6f', // Example hash
      tls_version: '1.2',
      cipher_suite_order: [
        'ECDHE-ECDSA-AES128-GCM-SHA256', 'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384', 'ECDHE-RSA-AES256-GCM-SHA384'
      ]
    }
  ]
};

/**
 * Common screen resolutions by device type
 */
const screenProfiles = {
  'desktop': [
    { width: 1920, height: 1080 }, // 1080p - Most common
    { width: 1366, height: 768 },  // Laptop common
    { width: 1536, height: 864 },  // Common laptop 
    { width: 1440, height: 900 },  // MacBook common
    { width: 2560, height: 1440 }, // 1440p
    { width: 3840, height: 2160 }, // 4K
  ],
  'mobile': [
    { width: 390, height: 844 },   // iPhone 14/13/12
    { width: 414, height: 896 },   // iPhone 11 Pro Max/XS Max
    { width: 375, height: 812 },   // iPhone X/XS
    { width: 360, height: 780 },   // Common Android
    { width: 412, height: 915 },   // Pixel 6
    { width: 360, height: 800 },   // Samsung Galaxy S21
  ],
  'tablet': [
    { width: 768, height: 1024 },  // iPad
    { width: 834, height: 1112 },  // iPad Pro 10.5
    { width: 820, height: 1180 },  // iPad Air
    { width: 800, height: 1280 },  // Common Android tablet
  ]
};

/**
 * WebGL rendering information by GPU and driver
 */
const webglProfiles = {
  'intel': {
    renderer: 'ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)',
    vendor: 'Google Inc. (Intel)',
    webglVersion: 'WebGL 2.0 (OpenGL ES 3.0 Chromium)'
  },
  'nvidia': {
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    vendor: 'Google Inc. (NVIDIA)',
    webglVersion: 'WebGL 2.0 (OpenGL ES 3.0 Chromium)'
  },
  'amd': {
    renderer: 'ANGLE (AMD, AMD Radeon RX 6800 XT Direct3D11 vs_5_0 ps_5_0, D3D11)',
    vendor: 'Google Inc. (AMD)',
    webglVersion: 'WebGL 2.0 (OpenGL ES 3.0 Chromium)'
  },
  'apple': {
    renderer: 'Apple M1',
    vendor: 'Apple Inc.',
    webglVersion: 'WebGL 2.0'
  }
};

/**
 * Timing patterns for human-like behavior
 */
const timingPatterns = {
  // Human-like page interaction patterns
  'pageLoad': {
    minDelay: 800,
    maxDelay: 3000,
    distribution: 'normal', // Gaussian distribution around mean
    mean: 1500,
    stdDev: 400
  },
  'resourceFetch': {
    minDelay: 50,
    maxDelay: 500,
    distribution: 'exponential', // Shorter times more likely
    lambda: 0.005
  },
  'subsequentRequests': {
    minDelay: 2000,
    maxDelay: 10000,
    distribution: 'mixed', // Mix of quick and delayed interactions
    patterns: [
      { weight: 7, min: 2000, max: 4000 }, // Quick follow-up
      { weight: 3, min: 5000, max: 10000 } // Delayed follow-up
    ]
  }
};

/**
 * Behavioral patterns that mimic human interactions
 */
const behavioralPatterns = {
  // Mouse movement patterns
  'mouseMovements': {
    enabled: false, // Not directly used in Node.js but could be used to model request timing
    patterns: ['direct', 'curved', 'hesitant']
  },
  
  // Navigation patterns for crawling
  'navigationPatterns': [
    {
      name: 'depth-first',
      description: 'Follows links deeply before exploring breadth',
      weight: 2
    },
    {
      name: 'breadth-first',
      description: 'Explores many links at the same level before going deeper',
      weight: 4
    },
    {
      name: 'random-walk',
      description: 'Random selection of links to follow',
      weight: 1
    },
    {
      name: 'targeted',
      description: 'Focuses on specific content types or keywords',
      weight: 3
    }
  ],
  
  // Session behaviors
  'sessionBehaviors': [
    {
      name: 'short-visit',
      pageViews: { min: 1, max: 3 },
      sessionDuration: { min: 10000, max: 60000 }, // 10s to 1min
      weight: 2
    },
    {
      name: 'medium-visit',
      pageViews: { min: 3, max: 10 },
      sessionDuration: { min: 60000, max: 300000 }, // 1min to 5min
      weight: 5
    },
    {
      name: 'deep-visit',
      pageViews: { min: 10, max: 30 },
      sessionDuration: { min: 300000, max: 1800000 }, // 5min to 30min
      weight: 3
    }
  ]
};

/**
 * Proxy configuration for IP rotation
 */
const proxyConfigurations = {
  // Example proxy configurations - these would be replaced with actual proxies
  // in a real implementation
  'standard': [
    { host: 'proxy1.example.com', port: 8080, username: 'user1', password: 'pass1' },
    { host: 'proxy2.example.com', port: 8080, username: 'user2', password: 'pass2' },
    { host: 'proxy3.example.com', port: 8080, username: 'user3', password: 'pass3' }
  ],
  'residential': [
    { host: 'res1.example.com', port: 9090, username: 'res1', password: 'pass1' },
    { host: 'res2.example.com', port: 9090, username: 'res2', password: 'pass2' }
  ],
  'datacenter': [
    { host: 'dc1.example.com', port: 7070, username: 'dc1', password: 'pass1' },
    { host: 'dc2.example.com', port: 7070, username: 'dc2', password: 'pass2' }
  ]
};

/**
 * Enhanced browser capabilities and limitations by browser type
 */
const browserCapabilities = {
  'Chrome': {
    cookieHandling: 'full',
    localStorage: true,
    webRTC: true,
    canvas: true,
    webGL: true,
    audioContext: true,
    mediaDevices: true,
    serviceWorkers: true,
    javascript: {
      ecmaVersion: 2021,
      features: ['async/await', 'modules', 'classes', 'arrow functions']
    }
  },
  'Firefox': {
    cookieHandling: 'full',
    localStorage: true,
    webRTC: true,
    canvas: true,
    webGL: true,
    audioContext: true,
    mediaDevices: true,
    serviceWorkers: true,
    javascript: {
      ecmaVersion: 2021,
      features: ['async/await', 'modules', 'classes', 'arrow functions']
    }
  },
  'Safari': {
    cookieHandling: 'limited',
    localStorage: true,
    webRTC: 'limited',
    canvas: true,
    webGL: true,
    audioContext: true,
    mediaDevices: 'limited',
    serviceWorkers: true,
    javascript: {
      ecmaVersion: 2021,
      features: ['async/await', 'modules', 'classes', 'arrow functions']
    }
  },
  'Edge': {
    cookieHandling: 'full',
    localStorage: true,
    webRTC: true,
    canvas: true,
    webGL: true,
    audioContext: true,
    mediaDevices: true,
    serviceWorkers: true,
    javascript: {
      ecmaVersion: 2021,
      features: ['async/await', 'modules', 'classes', 'arrow functions']
    }
  },
  'IE11': {
    cookieHandling: 'basic',
    localStorage: true,
    webRTC: false,
    canvas: 'limited',
    webGL: 'limited',
    audioContext: false,
    mediaDevices: false,
    serviceWorkers: false,
    javascript: {
      ecmaVersion: 5,
      features: []
    }
  }
};

/**
 * Get TLS fingerprint for a specific browser
 * @param {string} browserName - Name of the browser
 * @returns {Object} - TLS fingerprint data
 */
function getTLSFingerprint(browserName) {
  const fingerprints = tlsFingerprints[browserName] || tlsFingerprints['Chrome'];
  return fingerprints[Math.floor(Math.random() * fingerprints.length)];
}

/**
 * Get a random screen resolution based on device type
 * @param {string} deviceType - Device type (desktop, mobile, tablet)
 * @returns {Object} - Screen resolution {width, height}
 */
function getRandomScreenProfile(deviceType = 'desktop') {
  const profiles = screenProfiles[deviceType] || screenProfiles.desktop;
  return profiles[Math.floor(Math.random() * profiles.length)];
}

/**
 * Get WebGL rendering information based on GPU vendor
 * @param {string} gpuVendor - GPU vendor (intel, nvidia, amd, apple)
 * @returns {Object} - WebGL profile information
 */
function getWebGLProfile(gpuVendor = 'intel') {
  return webglProfiles[gpuVendor] || webglProfiles.intel;
}

/**
 * Get a random delay based on a timing pattern
 * @param {string} patternType - Type of timing pattern
 * @returns {number} - Delay in milliseconds
 */
function getRandomDelay(patternType = 'pageLoad') {
  const pattern = timingPatterns[patternType] || timingPatterns.pageLoad;
  
  let delay;
  switch (pattern.distribution) {
    case 'normal':
      // Basic normal distribution using Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      delay = Math.round(z0 * pattern.stdDev + pattern.mean);
      break;
      
    case 'exponential':
      delay = Math.round(-Math.log(Math.random()) / pattern.lambda);
      break;
      
    case 'mixed':
      // Select a sub-pattern based on weights
      const totalWeight = pattern.patterns.reduce((sum, p) => sum + p.weight, 0);
      const randomValue = Math.random() * totalWeight;
      
      let weightSum = 0;
      let selectedPattern = pattern.patterns[0];
      for (const p of pattern.patterns) {
        weightSum += p.weight;
        if (randomValue <= weightSum) {
          selectedPattern = p;
          break;
        }
      }
      
      delay = Math.floor(Math.random() * (selectedPattern.max - selectedPattern.min + 1)) + selectedPattern.min;
      break;
      
    default:
      // Uniform distribution
      delay = Math.floor(Math.random() * (pattern.maxDelay - pattern.minDelay + 1)) + pattern.minDelay;
  }
  
  // Ensure delay is within bounds
  return Math.max(pattern.minDelay, Math.min(pattern.maxDelay, delay));
}

/**
 * Get a random proxy configuration
 * @param {string} proxyType - Type of proxy (standard, residential, datacenter)
 * @returns {Object} - Proxy configuration
 */
function getRandomProxy(proxyType = 'standard') {
  const configs = proxyConfigurations[proxyType] || proxyConfigurations.standard;
  return configs[Math.floor(Math.random() * configs.length)];
}

module.exports = {
  tlsFingerprints,
  screenProfiles,
  webglProfiles,
  timingPatterns,
  behavioralPatterns,
  proxyConfigurations,
  browserCapabilities,
  getTLSFingerprint,
  getRandomScreenProfile,
  getWebGLProfile,
  getRandomDelay,
  getRandomProxy
};
