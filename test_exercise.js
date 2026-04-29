const http = require('http');

async function request(method, path, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('--- ' + method + ' ' + path + ' ---');
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
        try {
          resolve({ status: res.statusCode, body: body ? JSON.parse(body) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

(async () => {
  try {
    const email = 'user' + Date.now() + '@example.com';
    const password = 'password123';
    
    // 1. Register
    const regRes = await request('POST', '/api/auth/register', { name: 'Test User', email, password });
    
    // 2. Login
    const loginRes = await request('POST', '/api/auth/login', { email, password });
    const token = loginRes.body.token;

    if (!token) {
      console.log('No token received');
      return;
    }

    // 3. Create Project
    await request('POST', '/api/projects', { title: 'Test Project', description: 'Testing projects', techStack: 'Node.js', batch: '2024' }, token);

    // 4. Get Projects
    await request('GET', '/api/projects', null, token);

  } catch (e) {
    console.error('Execution error:', e.message);
  }
})();
