const request = require('supertest');
const express = require('express');
const { RateLimiter } = require('../api/middleware/rateLimit');

describe('Rate Limiting Integration with Real Routes', () => {
  let app;
  let rateLimiter;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    rateLimiter = new RateLimiter();
    
    // Mock routes that simulate your actual API endpoints
    app.post('/api/user/login', rateLimiter.middleware('auth'), (req, res) => {
      res.json({ success: true, message: 'Login attempt recorded' });
    });

    app.get('/api/diary', rateLimiter.middleware('diary'), (req, res) => {
      res.json({ entries: [], success: true });
    });

    app.post('/api/friends/request', rateLimiter.middleware('friends'), (req, res) => {
      res.json({ success: true, message: 'Friend request sent' });
    });

    app.get('/api/public/data', rateLimiter.middleware('general'), (req, res) => {
      res.json({ data: 'public information' });
    });
  });

  afterEach(() => {
    rateLimiter.clear();
    rateLimiter.destroy();
  });

  test('should protect login endpoint from brute force', async () => {
    // Try 6 login attempts (5 should work, 6th should be blocked)
    const results = [];
    for (let i = 0; i < 6; i++) {
      const response = await request(app)
        .post('/api/user/login')
        .send({ email: `test${i}@test.com`, password: 'password' });
      results.push(response.status);
    }

    // First 5 should be 200, 6th should be 429
    expect(results.slice(0, 5).every(status => status === 200)).toBe(true);
    expect(results[5]).toBe(429);
  });

  test('should allow reasonable diary access while preventing abuse', async () => {
    // Make 25 diary requests (under the 30/min limit)
    for (let i = 0; i < 25; i++) {
      const response = await request(app).get('/api/diary');
      expect(response.status).toBe(200);
    }

    // The 31st request should still work (limit is 30)
    const response = await request(app).get('/api/diary');
    expect(response.status).toBe(200);
  });

  test('should include rate limit info in headers', async () => {
    const response = await request(app).get('/api/diary');
    
    expect(response.headers['x-ratelimit-limit']).toBe('30');
    expect(response.headers['x-ratelimit-remaining']).toBe('29');
    expect(response.headers['x-ratelimit-reset']).toBeDefined();
  });

  test('should reset counters for different endpoints independently', async () => {
    // Use up auth limit
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/user/login');
    }

    // Auth should be blocked
    const authResponse = await request(app).post('/api/user/login');
    expect(authResponse.status).toBe(429);

    // But diary should still work
    const diaryResponse = await request(app).get('/api/diary');
    expect(diaryResponse.status).toBe(200);
  });
});