
const validateUserInput = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') return next()
  const { uid, username, friendId, myID, newName, title, notes, search } = req.body;
  const querySearch = req.query?.search;
  
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

  // validate for diary entry
  const validateTextField = (field, value, fieldName) => {
    if (!value || typeof value !== 'string') return true;

    //block common injections
    //used ai to generate patterns
    const dangerousPatterns = [
      // SQL injection
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b/i,
      /(\-\-|\/\*|\*\/|;)/g,
      /(\$where|\$ne|\$regex)/i, // NoSQL
      
      // XSS attempts
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      
      // Command injection
      /(\|\||&&|;|`|\$\(|\$\{)/,
      
      // Path traversal
      /(\.\.\/|\.\.\\|~\/)/,
    ];
    if (dangerousPatterns.some(pattern => pattern.test(value))) {
      console.log(`Blocked dangerous input in ${fieldName}: ${value.substring(0, 50)}`);
      return false;
    } 
    return true;
  };
   // validate title
   if (title && !validateTextField('title', title, 'title')) {
    return res.status(400).json({ error: "Invalid characters in title" });
  }
  // validate notes
  if (notes && !validateTextField('notes', notes, 'notes')) {
    return res.status(400).json({ error: "Invalid characters in notes" });
  }
  // validate search in body
  if (search && !validateTextField('search', search, 'search')) {
    return res.status(400).json({ error: "Invalid characters in search" });
  }
  // also query params
  if (querySearch && !validateTextField('search', querySearch, 'search query')) {
    return res.status(400).json({ error: "Invalid characters in search query" });
  }
  // also string fields
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      if (!validateTextField(key, req.body[key], key)) {
        return res.status(400).json({ error: `Invalid characters in ${key}` });
      }
    }
  });
  
  next();
};


const sanitizeInput = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") return next()
  
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    // Trim whitespace and limit length
    let sanitized = str.trim();
    // enforce 255 character max to match tests
    if (sanitized.length > 255) {
      sanitized = sanitized.substring(0, 255);
    }
    // no control chara
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Basic XSS protection
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    // remove null
    sanitized = sanitized.replace(/\0/g, '');
    return sanitized;
  };
    
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = sanitizeString(req.body[key]);
    }
  });
  //and query params
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }
  next();
};

// Rate limiting storage (in-memory for simplicity)
const rateLimit = (windowMs = 900000, maxRequests = 100) => { // 15 minutes
  const requestCounts = new Map();
  return (req, res, next) => {
    let ip = req.ip;
    
    if (req.headers['x-forwarded-for']) {
      ip = req.headers['x-forwarded-for'].split(',')[0].trim();
    } else if (req.headers['x-real-ip']) {
      ip = req.headers['x-real-ip'];
    } else if (req.connection && req.connection.remoteAddress) {
      ip = req.connection.remoteAddress;
    }
    // clean ip
    ip = ip.replace(/^::ffff:/, '').split(':')[0];

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
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return res.status(429).json({ 
        error: 'Too many requests, please try again later', 
        retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
      });
    }
    
    // Add current request
    requests.push(now);
    console.log(`IP: ${ip}, Requests remaining: ${maxRequests - requests.length}`);
    
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - requests.length);
    res.setHeader('X-RateLimit-Reset', new Date(requests[0] + windowMs).toISOString());
    next();
  };
};

module.exports = { validateUserInput, sanitizeInput, rateLimit };