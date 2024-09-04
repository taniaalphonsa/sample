require('dotenv').config();
const express = require('express');
const winstonLogger = require('./logger').winstonLogger;
const bunyanLogger = require('./logger').bunyanLogger;

const app = express();
app.use(express.json());

// In-memory storage for failed login attempts
const failedLoginAttempts = {};
const blockedIps = new Set();

// Function to monitor login attempts
const monitorLogin = (username, password, ip) => {
    const correctUsername = 'admin';
    const correctPassword = '12345';

    if (blockedIps.has(ip)) {
        // Logging the blocked IP trying to log in
        winstonLogger.warn(`Blocked IP ${ip} tried to log in.`);
        bunyanLogger.warn({ ip }, 'Blocked IP tried to log in');
        return 'blocked'; // IP is blocked
    }

    if (username === correctUsername && password === correctPassword) {
        // Reset failed attempts on successful login
        failedLoginAttempts[ip] = 0;
        return true; // Successful login
    } else {
        // Increment failed attempts count
        if (!failedLoginAttempts[ip]) {
            failedLoginAttempts[ip] = 0;
        }
        failedLoginAttempts[ip] += 1;

        // Block the IP if it reaches 3 failed attempts
        if (failedLoginAttempts[ip] >= 3) {
            blockedIps.add(ip);
            winstonLogger.warn(`IP ${ip} is now blocked after 3 failed attempts.`);
            bunyanLogger.warn({ ip }, 'IP blocked after 3 failed login attempts');
        }

        return false; // Failed login
    }
};

// Function to monitor access attempts
const monitorAccess = (ip) => {
    const allowedIps = ['127.0.0.1', '192.168.1.1']; // Example allowed IPs
    return allowedIps.includes(ip);
};

// Example endpoints to simulate login and access
app.post('/login', (req, res) => {
    const { username, password, ip } = req.body;

    if (!ip) {
        res.status(400).send('IP address is required');
        return;
    }

    const loginResult = monitorLogin(username, password, ip);

    if (loginResult === 'blocked') {
        res.status(403).send('Your IP is blocked due to multiple failed login attempts.');
    } else if (loginResult) {
        winstonLogger.info(`Successful login for user: ${username} from IP: ${ip}`);
        bunyanLogger.info({ username, ip }, 'Successful login');
        res.status(200).send('Login successful');
    } else {
        winstonLogger.warn(`Failed login attempt for user: ${username} from IP: ${ip}`);
        bunyanLogger.warn({ username, ip }, 'Failed login attempt');
        res.status(401).send('Login failed');
    }
});

app.get('/access', (req, res) => {
    const { ip } = req.query;

    if (!ip) {
        res.status(400).send('IP address is required');
        return;
    }

    const isAllowed = monitorAccess(ip);

    if (isAllowed) {
        winstonLogger.info(`Access allowed from IP: ${ip}`);
        bunyanLogger.info({ ip }, 'Access allowed');
        res.status(200).send('Access granted');
    } else {
        winstonLogger.warn(`Access denied for IP: ${ip}`);
        bunyanLogger.warn({ ip }, 'Access denied');
        res.status(403).send('Access denied');
    }
});

app.post('/analyze-logs', async (req, res) => {
    try {
        const logs = req.body.logs; // Logs are passed in the body
        const analysis = await analyzeLogs(logs);

        winstonLogger.info('Logs analyzed successfully');
        bunyanLogger.info('Logs analyzed successfully');
        res.status(200).send({ analysis });
    } catch (error) {
        winstonLogger.error('Error analyzing logs:', error.message);
        bunyanLogger.error({ error: error.message }, 'Error analyzing logs');
        res.status(500).send('Failed to analyze logs');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    winstonLogger.info(`Server started on port ${PORT}`);
    bunyanLogger.info({ port: PORT }, 'Server started');
});
