const fs = require('fs');
const path = require('path');

// Define the log directory and file path
const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'suspicious_activity.log');

// Ensure that the log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Log suspicious activity
const logSuspiciousActivity = (req, reason) => {
    const log = `IP: ${req.ip}, URL: ${req.url}, Method: ${req.method}, Reason: ${reason}, Time: ${new Date().toISOString()}\n`;
    fs.appendFileSync(logFile, log);
    //sendAlert(log);
};

// Function to check for SQL injection patterns in the request body and query
const containsSqlInjection = (data) => {
    const sqlInjectionPattern = /(\%27)|(\')|(\-\-)|(\%23)|(#)/i;
    for (const key in data) {
        if (sqlInjectionPattern.test(data[key])) {
            return true;
        }
    }
    return false;
};

// WAF Middleware
const wafMiddleware = (req, res, next) => {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const url = req.url;
    const method = req.method;

    // Example: Block requests from certain IPs
    const blockedIPs = ['192.168.1.1', '10.0.0.1', '192.168.1.191'];
    if (blockedIPs.includes(ip)) {
        logSuspiciousActivity(req, 'Blocked IP');
        return res.status(403).send('Access Denied');
    }

    // Block requests containing SQL injection patterns in query and body
    if (containsSqlInjection(req.query) || containsSqlInjection(req.body)) {
        logSuspiciousActivity(req, 'SQL Injection Attempt');
        return res.status(403).send('Malicious activity detected');
    }

    // Example: Block requests with suspicious user-agents (basic bot detection)
    const blockedUserAgents = [/curl/i, /wget/i];
    if (blockedUserAgents.some(ua => ua.test(userAgent))) {
        logSuspiciousActivity(req, 'Suspicious User-Agent');
        return res.status(403).send('Access Denied');
    }

    // Pass the request to the next middleware if no issues found
    next();
};

module.exports = wafMiddleware;