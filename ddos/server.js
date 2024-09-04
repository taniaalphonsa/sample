const express = require('express');
const app = express();

app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`Request received from IP: ${ip}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
