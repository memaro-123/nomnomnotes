const request = require('supertest');
const express = require('express');
const { RateLimiter } = require('../api/middleware/rateLimit');

describe('Rate Limiting Security', () => {
  let app;
  let rateLimiter;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Create a fresh instance for each test
    rateLimiter = new RateLimiter();
  });

  afterEach(() => {
    // Clean up after each test
    rateLimiter.clear();
    rateLimiter.destroy();
  });

  // TEST 1: Basic Rate Limiting
  describe('Basic Rate Limiting', () => {
    test('should allow requests under the limit', async () => {
      app.use(rateLimiter.middleware('general'));
      app.get('/test', (req, res) => {
        res.json({ message: 'Success' });
      });

      // Make 5 requests (under general limit of 100/min)
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get('/test');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');
      }
    });

    test('should block requests over the limit', async () => {
      app.use(rateLimiter.middleware('auth')); // 5 requests per 15 min
      app.post('/login', (req, res) => {
        res.json({ message: 'Login successful' });
      });

      // Make 6 requests (over the limit)
    const promises = [];
    for (let i = 0; i < 6; i++) {
      promises.push(request(app).post('/login'));
    }

    const responses = await Promise.all(promises);
    
    // First 5 should succeed, 6th should be blocked
    for (let i = 0; i < 5; i++) {
      expect(responses[i].status).toBe(200);
    }
    expect(responses[5].status).toBe(429);
    expect(responses[5].body.error).toContain('Too many requests');
  });
});

  // TEST 2: Different Limits for Different Endpoints
  describe('Endpoint-Specific Limits', () => {
    test('should apply different limits to different routes', async () => {
      app.post('/login', rateLimiter.middleware('auth'), (req, res) => {
        res.json({ message: 'Login' });
      });

      app.get('/diary', rateLimiter.middleware('diary'), (req, res) => {
        res.json({ message: 'Diary entries' });
      });

      // Exceed auth limit (5 requests)
      for (let i = 0; i < 6; i++) {
        const response = await request(app).post('/login');
        if (i < 5) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(429);
        }
      }

      // Diary should still work (limit is 30/min)
      for (let i = 0; i < 10; i++) {
        const response = await request(app).get('/diary');
        expect(response.status).toBe(200);
      }
    });
  });

  // TEST 3: Rate Limit Headers
  describe('Rate Limit Headers', () => {
    test('should include rate limit headers in response', async () => {
      app.use(rateLimiter.middleware('general'));
      app.get('/test-headers', (req, res) => {
        res.json({ message: 'Success' });
      });

      const response = await request(app).get('/test-headers');

      expect(response.headers['x-ratelimit-limit']).toBe('100');
      expect(response.headers['x-ratelimit-remaining']).toBe('99');
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });
  });

  // TEST 4: IP-Based Limiting
  describe('IP-Based Limiting', () => {
    test('should limit by IP address', async () => {
      app.use(rateLimiter.middleware('auth'));
      app.post('/login', (req, res) => {
        res.json({ message: 'Login' });
      });

      // Mock different IPs using headers
      const makeRequest = (ip) => request(app)
        .post('/login')
        .set('X-Test-IP', ip);

      // IP 1: Make 5 requests (limit)
      for (let i = 0; i < 5; i++) {
        const response = await makeRequest('192.168.1.1');
        expect(response.status).toBe(200);
      }

      // IP 1: 6th request should be blocked
      const blockedResponse = await makeRequest('192.168.1.1');
      expect(blockedResponse.status).toBe(429);

      // IP 2: Should still work (different IP)
      const newIpResponse = await makeRequest('192.168.1.2');
      expect(newIpResponse.status).toBe(200);
    });
  });

  // TEST 5: Cleanup Mechanism
  describe('Memory Cleanup', () => {
    test('should clean up old entries', () => {
      // Add some old entries
      const oldTime = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago
      rateLimiter.requests.set('old-key', [oldTime]);
      rateLimiter.requests.set('new-key', [Date.now()]);

      rateLimiter.cleanup();

      expect(rateLimiter.requests.has('old-key')).toBe(false);
      expect(rateLimiter.requests.has('new-key')).toBe(true);
    });
  });
});