// logger.js

const winston = require('winston');
const bunyan = require('bunyan');

// Winston logger configuration
const winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'winston.log' })
    ]
});

// Bunyan logger configuration
const bunyanLogger = bunyan.createLogger({ name: 'myapp', level: 'info' });

module.exports = { winstonLogger, bunyanLogger };
