const { validateUserInput, sanitizeInput } = require('../api/middleware/validateInput');

describe('Basic Security Middleware Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = (body) => ({
      body,
      headers: {}
    });
    
    mockRes = () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    });
    
    mockNext = jest.fn();
  });

  describe('validateUserInput', () => {
    test('should block SQL injection in username', () => {
      const req = mockReq({ username: "admin'; DROP TABLE users; --" });
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Invalid username format')
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should block invalid UID format', () => {
      const req = mockReq({ uid: "123' OR '1'='1" });
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Invalid UID format')
      });
    });

    test('should allow valid inputs', () => {
      const req = mockReq({ 
        uid: 'abcdefghijklmnopqrstuvwxyz12', // 28 chars
        username: 'valid_user123'
      });
      const res = mockRes();
      
      validateUserInput(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('sanitizeInput', () => {
    test('should trim whitespace', () => {
      const req = mockReq({ input: '   test   ' });
      const res = mockRes();
      
      sanitizeInput(req, res, mockNext);
      
      expect(req.body.input).toBe('test');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should limit input length', () => {
      const longString = 'a'.repeat(300);
      const req = mockReq({ input: longString });
      const res = mockRes();
      
      sanitizeInput(req, res, mockNext);
      
      expect(req.body.input.length).toBe(255);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should escape HTML characters', () => {
      const req = mockReq({ input: '<script>alert("xss")</script>' });
      const res = mockRes();
      
      sanitizeInput(req, res, mockNext);
      
      expect(req.body.input).toContain('&lt;');
      expect(req.body.input).toContain('&gt;');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});