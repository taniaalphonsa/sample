const axios = require('axios');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const serverUrl = 'http://localhost:3002'; // Your server URL
const totalRequests = 150; // Total number of requests to send
const delayBetweenRequests = 50; // Delay between requests in milliseconds
const reportDir = path.join(__dirname, 'report');

// Ensure the report directory exists
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir);
}

let successfulRequests = 0;
let rateLimitedRequests = 0;

async function sendRequest() {
  try {
    const response = await axios.get(serverUrl);
    console.log(`Status: ${response.status}, Data: ${response.data}`);
    successfulRequests++;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log(`Status: ${error.response.status}, Message: ${error.response.data}`);
      rateLimitedRequests++;
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function runTest() {
  for (let i = 0; i < totalRequests; i++) {
    console.log(`Sending request ${i + 1}/${totalRequests}`);
    await sendRequest();
    await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
  }

  generatePdfReport();
}

function generatePdfReport() {
  const doc = new PDFDocument();
  const fileName = `rate_limit_test_report.pdf`;
  const filePath = path.join(reportDir, fileName);

  // Write the PDF to the file system
  doc.pipe(fs.createWriteStream(filePath));

  // Add content to the PDF
  doc.fontSize(24).text('Rate Limit Test Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(18).text(`Total Requests Sent: ${totalRequests}`);
  doc.text(`Successful Requests: ${successfulRequests}`);
  doc.text(`Rate Limited Requests: ${rateLimitedRequests}`);
  doc.moveDown();

  if (rateLimitedRequests > 0) {
    doc.fontSize(16).fillColor('red').text('DoS Attack Detected', { align: 'center' });
  } else {
    doc.fontSize(16).fillColor('green').text('No DoS Attack Detected', { align: 'center' });
  }

  doc.moveDown();
  doc.fontSize(12).fillColor('black').text('This report was generated automatically by the test script.');

  doc.end();

  console.log(`PDF report generated successfully at ${filePath}`);
}

runTest();
