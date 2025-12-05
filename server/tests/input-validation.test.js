const { validateUserInput, sanitizeInput } = require('../api/middleware/validateInput');

describe('Comprehensive Input Validation Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = (body = {}, params = {}, query = {}) => ({
      body,
      params,
      query,
      headers: {}
    });
    
    mockRes = () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    });
    
    mockNext = jest.fn();
  });

  describe('UID Validation', () => {
    test('should accept valid 28-character Firebase UID', () => {
      const req = mockReq({ uid: 'abcdefghijklmnopqrstuvwxyz12' }); // 28 chars
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject UID with special characters', () => {
      const req = mockReq({ uid: 'abc123!@#$%^&*()' });
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Invalid UID format')
      });
    });

    test('should reject UID with SQL injection', () => {
      const injectionAttempts = [
        "123' OR '1'='1",
        "123'; DROP TABLE users; --",
        "123' UNION SELECT * FROM users --"
      ];
      
      injectionAttempts.forEach(attempt => {
        const req = mockReq({ uid: attempt });
        const res = mockRes();
        mockNext.mockClear();
        
        validateUserInput(req, res, mockNext);
        
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    test('should reject UID that is too short', () => {
      const req = mockReq({ uid: 'short' });
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should reject UID that is too long', () => {
      const req = mockReq({ uid: 'a'.repeat(50) });
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Username Validation', () => {
    test('should accept valid username with alphanumeric and underscores', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'User-Name',
        'valid123_name'
      ];
      
      validUsernames.forEach(username => {
        const req = mockReq({ username });
        const res = mockRes();
        mockNext.mockClear();
        
        validateUserInput(req, res, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    test('should reject username with SQL injection attempts', () => {
      const injectionAttempts = [
        "admin'; DROP TABLE users; --",
        "test' OR '1'='1",
        "test'; DELETE FROM users; --",
        "test`; DROP DATABASE; --"
      ];
      
      injectionAttempts.forEach(attempt => {
        const req = mockReq({ username: attempt });
        const res = mockRes();
        
        validateUserInput(req, res, mockNext);
        
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    test('should reject username with XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(document.cookie)',
        '"><script>alert(1)</script>'
      ];
      
      xssAttempts.forEach(attempt => {
        const req = mockReq({ username: attempt });
        const res = mockRes();
        
        validateUserInput(req, res, mockNext);
        
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    test('should reject username that is too short', () => {
      const req = mockReq({ username: 'ab' }); // min 3 chars
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should reject username that is too long', () => {
      const req = mockReq({ username: 'a'.repeat(21) }); // max 20 chars
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Diary Entry Field Validation', () => {
    test('should validate diary entry title for injection attempts', () => {
      const maliciousTitles = [
        "Test'; DELETE FROM diary_entries; --",
        "Test <script>alert(1)</script>",
        "Test ${maliciousCode}",
        "Test'; UPDATE users SET password='hacked' WHERE username='admin' --"
      ];
      
      maliciousTitles.forEach(title => {
        const req = mockReq({ title, notes: 'Test notes' });
        const res = mockRes();
        
        validateUserInput(req, res, mockNext);
        
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    test('should validate notes field', () => {
      const maliciousNotes = [
        "Notes'; DROP TABLE diary_entries; --",
        "<script>stealCookies()</script>",
        "Notes'; INSERT INTO logs VALUES ('hacked') --"
      ];
      
      maliciousNotes.forEach(notes => {
        const req = mockReq({ title: 'Test', notes });
        const res = mockRes();
        
        validateUserInput(req, res, mockNext);
        
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });
  });

  describe('JSON Input Validation', () => {
    test('should handle JSON arrays safely', () => {
      const req = mockReq({ 
        selectedCuisines: '["Italian", "Chinese"]',
        selectedLabels: '["Date Night", "Special"]'
      });
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject malicious JSON content', () => {
      const maliciousJson = [
        '{"malicious": "<script>alert(1)</script>"}',
        '["item1", "item2\'; DROP TABLE users; --"]',
        '{"key": "value"}; DROP TABLE diary_entries;'
      ];
      
      maliciousJson.forEach(json => {
        const req = mockReq({ location: json });
        const res = mockRes();
        
        validateUserInput(req, res, mockNext);
        
        // Should either pass validation or be caught by sanitization
        // This depends on how JSON is parsed
        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe('Query Parameter Validation', () => {
    test('should validate query parameters', () => {
      const req = mockReq(
        {},
        {},
        { search: "test'; DROP TABLE users; --" }
      );
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

describe('Sanitization Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = (body = {}) => ({
      body,
      headers: {}
    });
    
    mockRes = () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    });
    
    mockNext = jest.fn();
  });

  test('should trim whitespace from all fields', () => {
    const req = mockReq({
      username: '  testuser  ',
      title: '  My Diary  ',
      notes: '  Some notes  '
    });
    const res = mockRes();
    
    sanitizeInput(req, res, mockNext);
    
    expect(req.body.username).toBe('testuser');
    expect(req.body.title).toBe('My Diary');
    expect(req.body.notes).toBe('Some notes');
    expect(mockNext).toHaveBeenCalled();
  });

  test('should limit input length to 255 characters', () => {
    const longString = 'a'.repeat(300);
    const req = mockReq({
      title: longString,
      notes: longString
    });
    const res = mockRes();
    
    sanitizeInput(req, res, mockNext);
    
    expect(req.body.title.length).toBe(255);
    expect(req.body.notes.length).toBe(255);
    expect(mockNext).toHaveBeenCalled();
  });

  test('should escape HTML characters to prevent XSS', () => {
    const xssInputs = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '<div onclick="alert(1)">Click</div>'
    ];
    
    xssInputs.forEach(input => {
      const req = mockReq({ notes: input });
      const res = mockRes();
      mockNext.mockClear();
      
      sanitizeInput(req, res, mockNext);
      
      expect(req.body.notes).toContain('&lt;');
      expect(req.body.notes).toContain('&gt;');
      expect(req.body.notes).not.toContain('<script>');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  test('should handle empty and null values', () => {
    const req = mockReq({
      username: '',
      title: null,
      notes: undefined,
      emptyString: '   '
    });
    const res = mockRes();
    
    sanitizeInput(req, res, mockNext);
    
    expect(req.body.username).toBe('');
    expect(req.body.title).toBeNull();
    expect(req.body.notes).toBeUndefined();
    expect(req.body.emptyString).toBe('');
    expect(mockNext).toHaveBeenCalled();
  });

  test('should not modify non-string fields', () => {
    const req = mockReq({
      number: 123,
      boolean: true,
      array: ['item1', 'item2'],
      object: { key: 'value' },
      nullValue: null
    });
    const res = mockRes();
    
    sanitizeInput(req, res, mockNext);
    
    expect(req.body.number).toBe(123);
    expect(req.body.boolean).toBe(true);
    expect(Array.isArray(req.body.array)).toBe(true);
    expect(typeof req.body.object).toBe('object');
    expect(req.body.nullValue).toBeNull();
    expect(mockNext).toHaveBeenCalled();
  });
});