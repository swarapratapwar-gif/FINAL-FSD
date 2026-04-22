const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 5055;
const HOST = '127.0.0.1';

function createMultipartBody(boundary, fields, files) {
  let body = [];
  for (const [key, value] of Object.entries(fields)) {
    body.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`));
  }
  for (const [key, file] of Object.entries(files)) {
    const filename = path.basename(file.path);
    const content = fs.readFileSync(file.path);
    body.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"; filename="${filename}"\r\nContent-Type: application/pdf\r\n\r\n`));
    body.push(content);
    body.push(Buffer.from('\r\n'));
  }
  body.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(body);
}

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  try {
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';

    // 1. Register
    console.log('1. Registering user...');
    const regRes = await request({
      hostname: HOST, port: PORT, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ name: 'Test User', email, password }));
    console.log('Register Status:', regRes.statusCode);

    // 2. Login
    console.log('2. Logging in...');
    const loginRes = await request({
      hostname: HOST, port: PORT, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ email, password }));
    console.log('Login Status:', loginRes.statusCode);
    const loginBody = JSON.parse(loginRes.body);
    const token = loginBody.token;

    // Create dummy PDF files
    const resPaperPath = path.join(__dirname, 'research.pdf');
    const presPath = path.join(__dirname, 'presentation.pdf');
    fs.writeFileSync(resPaperPath, '%PDF-1.4 dummy research paper content');
    fs.writeFileSync(presPath, '%PDF-1.4 dummy presentation content');

    // 3. Submit Project
    console.log('3. Submitting project...');
    const boundary = '----Boundary' + crypto.randomBytes(8).toString('hex');
    const projectFields = {
      title: 'AI Research Project',
      description: 'A study on machine learning in healthcare.',
      techStack: 'Python, React, Node.js',
      batch: '2024',
      github: 'https://github.com/test/ai-project',
      linkedin: 'https://linkedin.com/in/test'
    };
    const projectFiles = {
      researchPaper: { path: resPaperPath },
      presentation: { path: presPath }
    };
    const multipartBody = createMultipartBody(boundary, projectFields, projectFiles);

    const submitRes = await request({
      hostname: HOST, port: PORT, path: '/api/projects', method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': multipartBody.length
      }
    }, multipartBody);
    console.log('Submit Status:', submitRes.statusCode);
    console.log('Submit Response Body:', submitRes.body);
    const submitJson = JSON.parse(submitRes.body);
    const project = submitJson.project;
    const projectId = project.id || project._id;
    const researchPaperFilename = project.researchPaper;
    const presentationFilename = project.presentation;

    // 4. GET /api/projects
    console.log('4. Listing projects...');
    const listRes = await request({
      hostname: HOST, port: PORT, path: '/api/projects', method: 'GET'
    });
    console.log('List projects Status:', listRes.statusCode);
    const projects = JSON.parse(listRes.body);
    const found = projects.find(p => (p.id || p._id) === projectId);
    console.log('Project found in list:', !!found);

    // 5. GET /api/projects/:id
    console.log('5. Getting project detail...');
    const detailRes = await request({
      hostname: HOST, port: PORT, path: `/api/projects/${projectId}`, method: 'GET'
    });
    console.log('Project detail Status:', detailRes.statusCode);
    console.log('Detail Response Body:', detailRes.body);
    const detail = JSON.parse(detailRes.body);
    console.log('Detail researchPaper:', detail.researchPaper || detail.project?.researchPaper);
    console.log('Detail presentation:', detail.presentation || detail.project?.presentation);

    // 6. Download files
    console.log('6. Downloading research paper...');
    const dlRes1 = await request({
      hostname: HOST, port: PORT, path: `/uploads/${researchPaperFilename}`, method: 'GET'
    });
    console.log('Download researchPaper Status:', dlRes1.statusCode);

    console.log('7. Downloading presentation...');
    const dlRes2 = await request({
      hostname: HOST, port: PORT, path: `/uploads/${presentationFilename}`, method: 'GET'
    });
    console.log('Download presentation Status:', dlRes2.statusCode);

    // Cleanup
    fs.unlinkSync(resPaperPath);
    fs.unlinkSync(presPath);

    console.log('\nTESTS FINISHED');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runTests();
