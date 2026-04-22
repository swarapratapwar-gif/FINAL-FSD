const http = require('http');

// Test 1: Register a user
console.log('\n🔷 TEST 1: User Registration');
const registerData = JSON.stringify({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

const registerOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(registerData)
  }
};

const registerReq = http.request(registerOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Response:', JSON.parse(data));
    
    // Test 2: Login
    if (res.statusCode === 201) {
      testLogin();
    }
  });
});

registerReq.on('error', err => {
  console.error('❌ Error:', err.message);
});

registerReq.write(registerData);
registerReq.end();

function testLogin() {
  console.log('\n🔷 TEST 2: User Login');
  const loginData = JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Response:', JSON.parse(data));
      testGetProjects();
    });
  });

  loginReq.on('error', err => console.error('❌ Error:', err.message));
  loginReq.write(loginData);
  loginReq.end();
}

function testGetProjects() {
  console.log('\n🔷 TEST 3: Get All Projects');
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/projects',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Projects:', JSON.parse(data));
    });
  });

  req.on('error', err => console.error('❌ Error:', err.message));
  req.end();
}
