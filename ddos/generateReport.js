const fs = require('fs');
const PDFDocument = require('pdfkit');

const generatePDFReport = (suspiciousIPs) => {
  const doc = new PDFDocument();

  // Set up the PDF file
  doc.pipe(fs.createWriteStream('ddos_report.pdf'));

  doc.fontSize(18).text('DDoS Attack Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text('Summary:', { underline: true });
  doc.moveDown();

  if (suspiciousIPs.length > 0) {
    doc.text(`Potential DDoS attack detected. ${suspiciousIPs.length} suspicious IPs found.`);
    doc.moveDown();

    doc.text('Details of suspicious IPs:', { underline: true });
    doc.moveDown();

    suspiciousIPs.forEach(({ ip, count }) => {
      doc.text(`IP: ${ip} - Requests: ${count}`);
    });
  } else {
    doc.text('No potential DDoS attack detected.');
  }

  doc.end();
};

module.exports = { generatePDFReport };
