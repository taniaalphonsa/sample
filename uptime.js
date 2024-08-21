const axios = require('axios');

const config = {
    serverUrl: 'http://localhost:3000',
    interval: 5000, // Check every 5 seconds
    timeout: 5000,  // Set a 5-second timeout for requests
};

const checkServer = async () => {
    try {
        const response = await axios.get(config.serverUrl, { timeout: config.timeout });
        if (response.status === 200) {
            console.log(`[${new Date().toISOString()}] Server is up and running.`);
        } else {
            console.log(`[${new Date().toISOString()}] Unexpected response status: ${response.status}`);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Server is down!`, error.message);
    }
};

setInterval(checkServer, config.interval);
