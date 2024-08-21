const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const rateLimit = require('express-rate-limit');

// In-memory store for tracking IP requests and timestamps
const requestCounts = {};
const DDoS_THRESHOLD = 100; // Define your DDoS threshold
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

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: DDoS_THRESHOLD, // Number of requests to trigger a report
  delayMs: 0 // No delay
});

app.use(limiter);

// Middleware to check for DoS attack and generate PDF
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (requestCounts[ip] && requestCounts[ip].count >= DDoS_THRESHOLD) {
    console.log(`High traffic detected from IP: ${ip}`);
    
    setTimeout(() => {
      // Check if high traffic persists after the pause
      if (requestCounts[ip] && requestCounts[ip].count >= DDoS_THRESHOLD) {
        console.log(`DoS attack detected from IP: ${ip}`);
        generatePdfReport(ip, requestCounts[ip].count, true); // true indicates DoS attack
      }
    }, PAUSE_TIME);

    res.status(429).send('Too Many Requests');
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
