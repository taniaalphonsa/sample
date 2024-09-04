const redis = require('redis');
const { promisify } = require('util');

// Create and configure Redis client
const client = redis.createClient({
    host: 'localhost', // Replace with your Redis host
    port: 6379         // Replace with your Redis port
});

// Promisify Redis methods for async/await
const setAsync = promisify(client.set).bind(client);

// Block the IP address
const blockIP = async (ip) => {
    try {
        await setAsync(`blocked_ip:${ip}`, 'blocked', 'EX', 86400); // Block for 24 hours
        console.log(`IP ${ip} has been blocked.`);
    } catch (err) {
        console.error('Error blocking IP:', err);
    } finally {
        client.quit();
    }
};

// Example usage
blockIP('192.168.1.1');
