const http = require('http');

console.log('🔷 Testing registration endpoint...\n');

const postData = JSON.stringify({
  name: 'Quick Test',
  email: 'quicktest@example.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      console.log('Response:', JSON.parse(data));
    } catch (e) {
      console.log('Raw Response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Request timeout after 5 seconds');
  req.destroy();
  process.exit(1);
});

console.log('Sending POST request to /api/auth/register...\n');
req.write(postData);
req.end();
