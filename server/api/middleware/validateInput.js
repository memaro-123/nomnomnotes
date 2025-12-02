
const validateUserInput = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') return next()
  const { uid, username, friendId, myID, newName } = req.body;
  
  // Validate UID format (Firebase UIDs are 28 characters)
  if (uid && !/^[a-zA-Z0-9]{28}$/.test(uid)) {
    return res.status(400).json({ error: "Invalid UID format" });
  }
  
  if (myID && !/^[a-zA-Z0-9]{28}$/.test(myID)) {
    return res.status(400).json({ error: "Invalid myID format" });
  }
  
  if (friendId && !/^[a-zA-Z0-9]{28}$/.test(friendId)) {
    return res.status(400).json({ error: "Invalid friendId format" });
  }
  
  // Validate username
  if (username && !/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
    return res.status(400).json({ error: "Invalid username format" });
  }
  
  if (newName && !/^[a-zA-Z0-9_-]{3,20}$/.test(newName)) {
    return res.status(400).json({ error: "Invalid newName format" });
  }
  
  // Prevent NoSQL injection-like patterns in any string field
  const stringFields = ['title', 'notes', 'search'];
  stringFields.forEach(field => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      // Block common injection patterns
      const dangerousPatterns = [
        /\$where/i, /\$ne/i, /\$nin/i, /\$regex/i, // NoSQL
        /(\b(SELECT|UPDATE|DELETE|DROP|INSERT|UNION|ALTER)\b)/i, // SQL
        /(\b(script|javascript|onload|onerror)\b)/i // XSS
      ];
      
      if (dangerousPatterns.some(pattern => pattern.test(req.body[field]))) {
        return res.status(400).json({ error: `Invalid characters in ${field}` });
      }
    }
  });
  
  next();
};

const sanitizeInput = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") return next()
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      // Trim and limit length
      req.body[key] = req.body[key].trim().substring(0, 255);
      
      // Basic XSS protection
      req.body[key] = req.body[key]
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  });
  next();
};

// Rate limiting storage (in-memory for simplicity)
const requestCounts = new Map();
const rateLimit = (windowMs = 900000, maxRequests = 100) => { // 15 minutes
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }
    
    const requests = requestCounts.get(ip);
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

module.exports = { validateUserInput, sanitizeInput, rateLimit };