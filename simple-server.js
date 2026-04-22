const express = require('express');
const app = express();

// Simple middleware
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  console.log('GET /test called');
  res.json({ message: 'GET working' });
});

app.post('/test', (req, res) => {
  console.log('POST /test called');
  console.log('Body:', req.body);
  res.json({ message: 'POST working', received: req.body });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Simple test server on port ${PORT}`);
});
