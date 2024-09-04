const axios = require('axios');

const serverUrl = 'http://localhost:3002'; // Your server URL
const totalRequests = 150; // Total number of requests to send
const delayBetweenRequests = 50; // Delay between requests in milliseconds

async function sendRequest() {
  try {
    const response = await axios.get(serverUrl);
    console.log(`Status: ${response.status}, Data: ${response.data}`);
  } catch (error) {
    if (error.response) {
      console.log(`Status: ${error.response.status}, Message: ${error.response.data}`);
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function runTest() {
  for (let i = 0; i < totalRequests; i++) {
    console.log(`Sending request ${i + 1}/${totalRequests}`);
    sendRequest();
    await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
  }
}

runTest();
