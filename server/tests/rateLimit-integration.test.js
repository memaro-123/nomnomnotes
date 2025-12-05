// once again, full disclosure, this test file was made with ai assistance
// i asked chatgpt to come up with comprehensive test boilerplates and some examples
// after i wrote my tests, i input it into chatgpt and asked if there were any cases i could be missing and took into consideration its advice
// oh yeah, after writing everything to my satisfaction, i did go through and use autocomplete comments where i thought it would be helpful
// this applies to all tests in server/tests
const request = require('supertest');
const express = require('express');

// Mock rate limiting middleware for testing
const rateLimit = require('../api/middleware/validateInput').rateLimit;

describe('Rate Limiting Integration Tests', () => {
  let app;
  let mockRequestCounts;

  beforeEach(() => {
    app = express();
    // trust proxy so req.ip respects X-Forwarded-For in tests
    app.set('trust proxy', true);
    app.use(express.json());
    
    // Reset rate limiting storage for each test
    mockRequestCounts = new Map();
    
    // Mock implementation for testing
    const testRateLimit = (windowMs = 1000, maxRequests = 5) => {
      return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!mockRequestCounts.has(ip)) {
          mockRequestCounts.set(ip, []);
        }
        
        const requests = mockRequestCounts.get(ip);
        const windowStart = now - windowMs;
        
        // Remove old requests
        while (requests.length > 0 && requests[0] < windowStart) {
          requests.shift();
        }
        
        // Check rate limit
        if (requests.length >= maxRequests) {
          return res.status(429).json({ 
            error: 'Too many requests, please try again later' 
          });
        }
        
        // Add current request
        requests.push(now);
        next();
      };
    };

    // Apply rate limiting middleware
    app.use(testRateLimit(1000, 5)); // 5 requests per second
    
    // Test endpoint
    app.get('/api/test', (req, res) => {
      res.json({ message: 'Success' });
    });
    
    app.post('/api/test', (req, res) => {
      res.json({ message: 'POST Success' });
    });
  });

  test('should allow requests within rate limit', async () => {
    const responses = [];
    
    // Make 5 requests quickly
    for (let i = 0; i < 5; i++) {
      const response = await request(app).get('/api/test');
      responses.push(response.status);
    }
    
    // All should be 200
    expect(responses.every(status => status === 200)).toBe(true);
  });

  test('should block requests exceeding rate limit', async () => {
    // Make 5 requests (within limit)
    for (let i = 0; i < 5; i++) {
      await request(app).get('/api/test');
    }
    
    // 6th request should be blocked
    const blockedResponse = await request(app).get('/api/test');
    
    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.body.error).toContain('Too many requests');
  });

  test('should reset rate limit after window expires', async () => {
    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      await request(app).get('/api/test');
    }
    
    // 6th should be blocked
    let response = await request(app).get('/api/test');
    expect(response.status).toBe(429);
    
    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Should work again
    response = await request(app).get('/api/test');
    expect(response.status).toBe(200);
  });

  test('should track different IPs separately', async () => {
    // Mock different IPs
    const mockIPs = ['192.168.1.1', '192.168.1.2'];
    
    // Make 5 requests from first IP
    for (let i = 0; i < 5; i++) {
      await request(app)
        .get('/api/test')
        .set('X-Forwarded-For', mockIPs[0]);
    }
    
    // First IP should be blocked
    let response = await request(app)
      .get('/api/test')
      .set('X-Forwarded-For', mockIPs[0]);
    expect(response.status).toBe(429);
    
    // Second IP should still work (first request)
    response = await request(app)
      .get('/api/test')
      .set('X-Forwarded-For', mockIPs[1]);
    expect(response.status).toBe(200);
  });

  test('should apply to all HTTP methods', async () => {
    // Make 3 GET requests
    for (let i = 0; i < 3; i++) {
      await request(app).get('/api/test');
    }
    
    // Make 3 POST requests
    for (let i = 0; i < 3; i++) {
      await request(app).post('/api/test');
    }
    
    // Next request should be blocked (total 7 > 5 limit)
    const response = await request(app).get('/api/test');
    expect(response.status).toBe(429);
  });

  test('should handle concurrent requests correctly', async () => {
    const requests = [];
    
    // Make 10 concurrent requests
    for (let i = 0; i < 10; i++) {
      requests.push(request(app).get('/api/test'));
    }
    
    const responses = await Promise.all(requests);
    
    // Count successful vs blocked responses
    const successful = responses.filter(r => r.status === 200).length;
    const blocked = responses.filter(r => r.status === 429).length;
    
    expect(successful).toBe(5); // Limit is 5
    expect(blocked).toBe(5); // 5 should be blocked
  });
});

// Test actual middleware with Express app
describe('Actual Rate Limit Middleware Tests', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    // trust proxy so req.ip reflects X-Forwarded-For when testing
    app.set('trust proxy', true);
    app.use(express.json());
    
    // Import and use actual rate limit middleware
    const { rateLimit } = require('../api/middleware/validateInput');
    app.use(rateLimit(1000, 3)); // 3 requests per second for testing
    
    app.get('/test', (req, res) => {
      res.json({ success: true });
    });
  });
  
  test('actual middleware should block excessive requests', async () => {
    // First 3 requests should succeed
    for (let i = 0; i < 3; i++) {
      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    }
    
    // 4th request should be blocked
    const response = await request(app).get('/test');
    expect(response.status).toBe(429);
    expect(response.body.error).toContain('Too many requests');
  });
});