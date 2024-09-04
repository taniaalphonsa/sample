const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const rateLimit = require('express-rate-limit');
const http = require('http');

// In-memory store for tracking IP requests and timestamps
const requestCounts = {};
const DDoS_THRESHOLD = 100; // Define the threshold (100 requests)
const PAUSE_TIME = 5000; // 5 seconds

// Create the report directory if it doesn't exist
const reportDir = path.join(__dirname, 'report');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir);
}

const app = express();

// Trust proxy headers for rate limiter to work with X-Forwarded-For header
app.set('trust proxy', 1);

// Middleware to count requests and timestamp
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts[ip]) {
    requestCounts[ip] = { count: 1, lastRequestTime: now };
  } else {
    requestCounts[ip].count++;
    requestCounts[ip].lastRequestTime = now;
  }

  console.log(`Request received from IP: ${ip}, Count: ${requestCounts[ip].count}`);
  next();
});

// Middleware to check for DoS attack and generate PDF
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (requestCounts[ip] && requestCounts[ip].count > DDoS_THRESHOLD) {
    console.log(`DoS attack detected from IP: ${ip}`);
    generatePdfReport(ip, requestCounts[ip].count, true); // true indicates DoS attack

    // Shut down the server
    console.log('Shutting down the server due to suspected DDoS attack...');
    server.close(() => {
      console.log('Server has been shut down.');
      process.exit(0); // Exit with success status
    });

    res.status(503).send('Server is temporarily not accepting more requests due to suspected DDoS attack.');
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Function to generate PDF report
function generatePdfReport(ip, requests, isDosAttack) {
  const doc = new PDFDocument();
  const fileName = isDosAttack ? 
    `dos_attack_report_${ip.replace(/:/g, '_')}.pdf` : 
    `no_dos_attack_report_${ip.replace(/:/g, '_')}.pdf`;
  const filePath = path.join(reportDir, fileName);

  // Write the PDF to the file system
  doc.pipe(fs.createWriteStream(filePath));

  // Add content to the PDF
  doc.fontSize(24).text(isDosAttack ? 'DoS Attack Report' : 'No DoS Attack Report', { align: 'center' });
  doc.fontSize(18).text(`IP Address: ${ip}`);
  doc.text(`Number of requests: ${requests}`);
  doc.fontSize(12).text('This report was generated automatically by the Node.js server.');

  doc.end();

  console.log(`PDF report generated successfully at ${filePath}`);
}

// Create and start the HTTP server
const server = http.createServer(app);

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
