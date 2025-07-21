const rateLimitMap = new Map();

const blockBadRequests = (req, res, next) => {
  const userAgent = (req.headers['user-agent'] || "").toLowerCase();
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  // 🔒 1. Block common attack tools via User-Agent
  const blockedAgents = ["curl", "httpie", "wget", "python", "perl", "java", "burpsuite", "libwww", "scan", "sqlmap"];
  if (blockedAgents.some(agent => userAgent.includes(agent))) {
    console.log("❌ Blocked suspicious User-Agent:", userAgent);
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  // 🧠 2. Rate limit based on IP
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip).filter(ts => now - ts < 3000); // 3 sec window
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  if (timestamps.length > 10) {
    console.log("⚠️ Too many requests from IP:", ip);
    return res.status(429).json({ success: false, message: "Too Many Requests" });
  }

  // 🔒 3. Optional: Check for missing Referer or Origin (for CSRF-style block)
  // if (!req.headers['referer'] && !req.headers['origin']) {
  //   return res.status(403).json({ success: false, message: "Suspicious request" });
  // }

  next();
};

module.exports = blockBadRequests;
