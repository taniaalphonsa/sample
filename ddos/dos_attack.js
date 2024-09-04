const axios = require('axios');

function getRandomIp() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.');
}

function getRandomIpWithPort() {
  const ip = getRandomIp();
  return `${ip}`;
}

// Function to send requests
async function sendRequests() {
  const totalRequests = 150; // Adjust the number of requests as needed
  const serverUrl = 'http://localhost:3000'; // Change this if the server is not running locally

  for (let i = 0; i < totalRequests; i++) {
    const fakeIp = getRandomIpWithPort();
    try {
      const response = await axios.get(serverUrl, {
        headers: { 'x-forwarded-for': fakeIp }
      });
      console.log(`Response from server: ${response.data}`);
      console.log(`IP Address: ${fakeIp}`);
    } catch (error) {
      console.error(`Error from IP ${fakeIp}:, error.message`);
    }
  }
}

// Call the function to send requests
sendRequests();