// middleware/blockSuspicious.js

module.exports = function blockSuspicious(options = {}) {
  const blockedIPs = new Map();
  const requestLogs = new Map();

  const BLOCK_DURATION_MS = options.blockDurationMs || 10 * 60 * 1000; // 10 minutes
  const MAX_REQUESTS_PER_MINUTE = options.maxRequestsPerMinute || 100;

  const suspiciousAgents = [
    'curl', 'python', 'wget', 'httpclient', 'java', 'libwww-perl', 'scrapy',
    'httpie', 'axios', 'postman', 'powershell', 'go-http-client', 'rest-client'
  ];

  const allowedOrigins = options.allowedOrigins || [
    'https://www.grabshort.online',
    'https://grabshort.online',
  ];

  const allowedIPs = options.allowedIPs || [];

  const allowedUserAgentsSubstr = options.allowedUserAgentsSubstr || [
    'mozilla', 'chrome', 'safari', 'firefox', 'edge', 'opera', 'android', 'iphone'
  ];

  function getClientIP(req) {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip
    );
  }

  function isUserAgentSuspicious(ua) {
    if (!ua) return true;
    const lowerUA = ua.toLowerCase();

    if (suspiciousAgents.some(bot => lowerUA.includes(bot))) return true;
    if (allowedUserAgentsSubstr.some(allowed => lowerUA.includes(allowed))) return false;
    return true;
  }

  function isOriginAllowed(origin) {
    if (!origin) return false;
    return allowedOrigins.includes(origin.toLowerCase());
  }

  function isIPAllowed(ip) {
    if (!ip) return false;
    return allowedIPs.includes(ip);
  }

  return (req, res, next) => {
    const ip = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const origin = req.headers.origin || '';
    const now = Date.now();

    // Whitelist origin or IP bypass
    if (isOriginAllowed(origin)) return next();
    if (isIPAllowed(ip)) return next();

    // Block if IP currently blocked
    if (blockedIPs.has(ip)) {
      const unblockTime = blockedIPs.get(ip);
      if (now < unblockTime) {
        return res.status(403).json({ error: '⛔ Your IP is temporarily blocked due to suspicious activity.' });
      } else {
        blockedIPs.delete(ip);
      }
    }

    // Check suspicious User-Agent
    if (isUserAgentSuspicious(userAgent)) {
      blockedIPs.set(ip, now + BLOCK_DURATION_MS);
      console.log(`[BLOCK] IP ${ip} blocked for suspicious User-Agent: ${userAgent}`);
      return res.status(403).json({ error: '⛔ Suspicious User-Agent detected. Access denied.' });
    }

    // Rate limiting
    if (!requestLogs.has(ip)) requestLogs.set(ip, []);
    const timestamps = requestLogs.get(ip).filter(ts => now - ts < 60000);
    timestamps.push(now);
    requestLogs.set(ip, timestamps);

    if (timestamps.length > MAX_REQUESTS_PER_MINUTE) {
      blockedIPs.set(ip, now + BLOCK_DURATION_MS);
      requestLogs.delete(ip);
      console.log(`[BLOCK] IP ${ip} blocked for exceeding rate limit.`);
      return res.status(429).json({ error: '⛔ Too many requests. Your IP is temporarily blocked.' });
    }

    next();
  };
};
