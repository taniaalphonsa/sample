    // server.js
    const express = require('express');
    const bodyParser = require('body-parser');
    const wafMiddleware = require('./middleware/wafMiddleware');
    const rateLimiter = require('./middleware/rateLimiter');

    const app = express();

    // Parse incoming request bodies
    app.use(bodyParser.json());

    // Apply rate limiting middleware
    app.use(rateLimiter);

    // Apply WAF middleware
    app.use(wafMiddleware);

    // Example route
    app.get('/', (req, res) => {
        res.send('Hello, World!');
    });

    app.get('/hi', (req, res) => {
        res.send('Hello, tania!');
    });

    app.post('/', (req, res) => {
        res.send('POST request to the root URL');
    });
    
    // Start the server
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
