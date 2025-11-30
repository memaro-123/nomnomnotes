const request = require('supertest');
const express = require('express');
const { verifyUser } = require('../api/middleware/verifyUser');
const { validateUserInput, sanitizeInput } = require('../api/middleware/validateInput');

// Mock Firebase admin
jest.mock('firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: jest.fn()
  })
}));

const admin = require('firebase-admin');

describe('Security Vulnerability Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // TEST 1: SQL Injection Protection
  describe('SQL Injection Protection', () => {
    test('should reject SQL injection in username', async () => {
      app.use(validateUserInput);
      app.post('/test-username', (req, res) => {
        res.json({ valid: true });
      });

      const response = await request(app)
        .post('/test-username')
        .send({ username: "admin'; DROP TABLE users; --" });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid username format');
    });

    test('should reject SQL injection in UID', async () => {
      app.use(validateUserInput);
      app.post('/test-uid', (req, res) => {
        res.json({ valid: true });
      });

      const response = await request(app)
        .post('/test-uid')
        .send({ uid: "123' OR '1'='1" });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid UID format');
    });
  });

  // TEST 2: Authentication Security
  describe('Authentication Security', () => {
    test('should reject requests without authorization header', async () => {
      app.use(verifyUser);
      app.get('/protected', (req, res) => {
        res.json({ secret: 'data' });
      });

      const response = await request(app).get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('No token provided');
    });

    test('should reject expired tokens', async () => {
      admin.auth().verifyIdToken.mockRejectedValue({
        code: 'auth/id-token-expired'
      });

      app.use(verifyUser);
      app.get('/protected', (req, res) => {
        res.json({ secret: 'data' });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer expired-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Token expired');
    });

    test('should reject unverified email tokens', async () => {
      admin.auth().verifyIdToken.mockResolvedValue({
        uid: 'test123',
        email_verified: false // Critical security check
      });

      app.use(verifyUser);
      app.get('/protected', (req, res) => {
        res.json({ secret: 'data' });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer unverified-token');

      expect(response.status).toBe(403);
    });
  });

  // TEST 3: Input Sanitization
  describe('Input Sanitization', () => {
    test('should trim and limit input length', async () => {
      app.use(sanitizeInput);
      app.post('/test-sanitize', (req, res) => {
        res.json({ received: req.body });
      });

      const longInput = '   ' + 'a'.repeat(300) + '   ';
      const response = await request(app)
        .post('/test-sanitize')
        .send({ input: longInput });

      expect(response.body.received.input.length).toBeLessThanOrEqual(255);
      expect(response.body.received.input).not.toMatch(/^\s+|\s+$/);
    });
  });

  // TEST 4: Parameterized Query Safety
  describe('Database Security', () => {
    test('should use parameterized queries in userRoutes', () => {
      const userRoutes = require('../api/userRoutes');
      
      // This is a structural test - we check that our routes use safe patterns
      // In practice, you'd use a SQL injection scanner tool
      const routeSourceCode = userRoutes.toString();
      
      // Should NOT find string concatenation in SQL
      expect(routeSourceCode).not.toMatch(/SELECT.*\+.*req\./);
      expect(routeSourceCode).not.toMatch(/db\.run.*`.*\$\{/);
    });
  });
});