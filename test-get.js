const http = require('http');

console.log('🔷 Testing GET /api/projects...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/projects',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Response (parsed):', Array.isArray(parsed) ? `[Array with ${parsed.length} items]` : parsed);
    } catch (e) {
      console.log('Raw Response:', data.substring(0, 200));
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Request timeout!');
  req.destroy();
  process.exit(1);
});

req.end();
