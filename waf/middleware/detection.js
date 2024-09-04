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
};

// Function to normalize input
const normalizeInput = (input) => {
    return input.replace(/\s+/g, ' ').toLowerCase().trim();
};

// Function to check for SQL injection patterns in the request body and query
const containsSqlInjection = (data) => {
    const sqlInjectionPatterns = [
        // Detect common SQL keywords and operators used in injections
        /(\bselect\b|\bunion\b|\bdelete\b|\bdrop\b|\binsert\b|\bupdate\b|\bexec\b|\bexecute\b|\bgrant\b|\brevoke\b|\balter\b)/i,
        /(\bor\b\s+\d+\s*=\s*\d+|\band\b\s+\d+\s*=\s*\d+)/i,  // Tautology
        /(\b'--|\b;--|\b' #|\b; #|\b--)|(;|\b--|\b#)/i, // Commenting and statement termination
        /(\bunion\b\s+\bselect\b)/i,  // UNION-based injection
        /(\bconcat\b|\bsubstring\b|\bsubstr\b|\bcast\b|\bconvert\b|\bgroup_concat\b)/i,  // Functions often used in SQLi
        /(\b0x[0-9A-Fa-f]{2,}|\bx'[\dA-Fa-f]+'|%27)/i,  // Hexadecimal and encoded inputs
        /(\bwhere\b.+\bin\b\s*\([\d,]+\))/i,  // IN clause injection
        /(\bload_file\b|\bschema\b|\binformation_schema\b|\bcolumns\b|\btables\b)/i  // Data retrieval attempts
    ];

    for (const key in data) {
        if (typeof data[key] === 'string') {
            const normalizedInput = normalizeInput(data[key]);
            for (const pattern of sqlInjectionPatterns) {
                if (pattern.test(normalizedInput)) {
                    return true;
                }
            }
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

    // Function to check for suspicious user-agents
const isSuspiciousUserAgent = (userAgent) => {
    // Expanded list of suspicious user-agent patterns
    const suspiciousPatterns = [
        /curl/i,          // Common command-line tool
        /wget/i,          // Command-line utility
        /bot/i,           // General bot detection
        /crawler/i,       // Web crawlers
        /spider/i,        // Search engine spiders
        /scraper/i,       // Data scrapers
        /newsbot/i,       // News bots
        /facebookexternalhit/i,  // Facebook scraper
        /slackbot/i,      // Slack bot
        /twitterbot/i,    // Twitter bot
        /discordbot/i,    // Discord bot
        /googlebot/i,     // Google crawler
        /bingbot/i,       // Bing crawler
        /baiduspider/i,   // Baidu crawler
        /yandexbot/i,     // Yandex crawler
        /seo/i,           // SEO tools
        /monitor/i,       // Monitoring tools
        /loader/i,        // Load testing tools
        /httpclient/i     // HTTP client libraries
    ];

    // Check if the user-agent matches any of the suspicious patterns
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
};

// WAF Middleware
const wafMiddleware = (req, res, next) => {
    const userAgent = req.headers['user-agent'];
    
    console.log('User-Agent:', userAgent); // For debugging

    // Apply the enhanced user-agent detection
    if (isSuspiciousUserAgent(userAgent)) {
        logSuspiciousActivity(req, 'Suspicious User-Agent');
        return res.status(403).send('Access Denied');
    }

    // Continue with other checks...
    next();
};


};

module.exports = wafMiddleware;
