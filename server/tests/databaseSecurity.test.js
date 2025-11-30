const sqlite3 = require('sqlite3');
const { paramExec, fetchAll } = require('../../sqlDB/helperFunctions');

describe('Database Security Tests', () => {
  let db;

  beforeAll(async () => {
    db = new sqlite3.Database(':memory:');
    // Set up test tables
    await paramExec(db, `
      CREATE TABLE test_users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        uid TEXT
      )
    `);
  });

  afterAll((done) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing DB:', err);
      }
      done();
    });
  });

  beforeEach(async () => {
    // Clear test data before each test
    await paramExec(db, 'DELETE FROM test_users');
  });

  test('parameterized queries should prevent SQL injection', async () => {
    // Create test table
    await paramExec(db, `
      CREATE TABLE IF NOT EXISTS test_users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        uid TEXT
      )
    `);

    await paramExec(db, `
      INSERT INTO test_users (username, uid) 
      VALUES (?, ?)
    `, ['safeuser', 'safeuid123']);

    // Attempt SQL injection - this should be safely handled
    const maliciousInput = "test'; DROP TABLE test_users; --";
    
    // This should NOT drop the table when using parameterized queries
    const users = await fetchAll(db, 
      "SELECT * FROM test_users WHERE username = ?", 
      [maliciousInput]
    );

    // Table should still exist and be queryable
    const tableExists = await fetchAll(db, 
      "SELECT name FROM sqlite_master WHERE type='table' AND name='test_users'"
    );

    expect(tableExists.length).toBe(1); // Table still exists
    expect(users.length).toBe(0); // No user found (safe)
  });

  test('input validation should block malicious patterns', () => {
    const { validateUserInput } = require('../api/middleware/validateInput');
    
    const mockReq = (body) => ({
      body,
      headers: {}
    });
    
    const mockRes = () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    });
    
    const mockNext = jest.fn();

    // Test various injection attempts
    const injectionAttempts = [
      "admin' OR '1'='1",
      "'; DROP TABLE users; --",
      "1; INSERT INTO users VALUES ('hacker', 'pass')",
      "test`; DELETE FROM users; --"
    ];

    injectionAttempts.forEach(attempt => {
      const req = mockReq({ username: attempt, uid: '123' });
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      // Should block the request
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
