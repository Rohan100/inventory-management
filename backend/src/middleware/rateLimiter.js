// Production-grade Rate Limiter Middleware
const requestCounts = new Map();

/**
 * Basic Leaky Bucket Rate Limiter
 * @param {number} limit Max requests per window
 * @param {number} windowMs Window duration in milliseconds
 */
function rateLimiter(limit = 100, windowMs = 60 * 1000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }

    const timestamps = requestCounts.get(ip).filter(ts => now - ts < windowMs);
    timestamps.push(now);
    requestCounts.set(ip, timestamps);

    if (timestamps.length > limit) {
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${limit} requests per minute allowed.`,
        retryAfterSeconds: Math.ceil((windowMs - (now - timestamps[0])) / 1000)
      });
    }

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - timestamps.length));
    next();
  };
}

module.exports = rateLimiter;
