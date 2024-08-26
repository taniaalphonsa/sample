// ids.js

const failedLogins = {};
const blacklistedIPs = ['192.168.1.10', '123.456.789.0'];

function monitorLogin(username, password, ip) {
    // Simulate authentication
    const isAuthenticated = username === 'admin' && password === 'password';

    if (!isAuthenticated) {
        if (!failedLogins[ip]) {
            failedLogins[ip] = 0;
        }
        failedLogins[ip] += 1;

        if (failedLogins[ip] >= 3) {
            blacklistedIPs.push(ip);
            return false;
        }
    }

    return isAuthenticated;
}

function monitorAccess(ip) {
    return !blacklistedIPs.includes(ip);
}

module.exports = {
    monitorLogin,
    monitorAccess,
};
