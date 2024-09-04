const axios = require('axios');

const config = {
    serverUrl: 'http://localhost:3000',
    interval: 5000, // Check every 5 seconds
    timeout: 5000,  // Set a 5-second timeout for requests
    retryCount: 3,  // Number of retries for transient errors
};

const checkServer = async () => {
    for (let attempt = 0; attempt < config.retryCount; attempt++) {
        try {
            const response = await axios.get(config.serverUrl, { timeout: config.timeout });
            if (response.status === 200) {
                console.log(`[${new Date().toISOString()}] Server is up and running.`);
                return; // Exit if the request is successful
            } else {
                console.log(`[${new Date().toISOString()}] Unexpected response status: ${response.status}`);
                return;
            }
        } catch (error) {
            if (attempt < config.retryCount - 1) {
                console.log(`[${new Date().toISOString()}] Server is down! read ${error.code}. Retrying...`);
            } else {
                console.error(`[${new Date().toISOString()}] Server is down! read ${error.code}`);
            }
        }
    }
};

setInterval(checkServer, config.interval);
