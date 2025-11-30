class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.cleanupInterval = null;

    this.limits = {
      auth: { windowMs: 15 * 60 * 1000, max: 5 },
      diary: { windowMs: 60 * 1000, max: 30 },
      friends: { windowMs: 60 * 1000, max: 20 },
      general: { windowMs: 60 * 1000, max: 100 }    
    };

    // dont start cleanup in test mode
    if (process.env.NODE_ENV !== 'test') {
      this.startCleanup();
    }
  }

  startCleanup() {
    // Only start cleanup if not already running and not in test mode
    if (!this.cleanupInterval && process.env.NODE_ENV !== 'test') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
  }

  middleware(limitType = 'general') {
    return (req, res, next) => {
      const limit = this.limits[limitType];
      if (!limit) {
        console.error(`Unknown limit type: ${limitType}`);
        return next();
      }

      const key = this.getKey(req, limitType);
      const now = Date.now();
      const windowStart = now - limit.windowMs;

      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }

      const userRequests = this.requests.get(key);

      // Remove requests that are outside the current time window
      while (userRequests.length > 0 && userRequests[0] < windowStart) {
        userRequests.shift();
      }

      // Check if the user has exceeded the rate limit
      if (userRequests.length >= limit.max) {
        const retryAfter = Math.ceil((userRequests[0] + limit.windowMs - now) / 1000);
        
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter,
          limit: limit.max,
          window: `${limit.windowMs / 1000 / 60} minutes`
        });
      }

      // Add the current request timestamp
      userRequests.push(now);
      
      // Set rate limit headers for client information
      res.set({
        'X-RateLimit-Limit': limit.max.toString(),
        'X-RateLimit-Remaining': (limit.max - userRequests.length).toString(),
        'X-RateLimit-Reset': new Date(now + limit.windowMs).toISOString()
      });

      next();
    };
  }

  getKey(req, limitType) {
    // Use a consistent IP for testing, real IP for production
    let ip;
    if (process.env.NODE_ENV === 'test') {
      // In tests, use a mock IP or the provided test IP
      ip = req.headers['x-test-ip'] || 'test-ip';
    } else {
      ip = req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           'unknown';
    }
    
    return `${ip}:${limitType}`;
  }

  cleanup() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => time > oneHourAgo);
      
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }

  // Clear all rate limit data (useful for tests)
  clear() {
    this.requests.clear();
  }

  // Stop the cleanup interval
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// For testing purposes
module.exports.RateLimiter = RateLimiter;

// For production use
const instance = new RateLimiter();
module.exports = instance;