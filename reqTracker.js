let requestCounts = {}; // Object to store request counts by IP
const DDoS_THRESHOLD = 100; // Number of requests per minute to consider a potential DDoS

const checkForDDoS = () => {
  const suspiciousIPs = [];
  const currentTime = Date.now();

  for (const ip in requestCounts) {
    // Check if the request count exceeds the threshold
    if (requestCounts[ip] > DDoS_THRESHOLD) {
      suspiciousIPs.push({ ip, count: requestCounts[ip] });
    }
  }

  return suspiciousIPs;
};

module.exports = { requestCounts, checkForDDoS, DDoS_THRESHOLD };
