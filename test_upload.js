const http = require('http');
const fs = require('fs');

async function request(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const email = 'test' + Date.now() + '@example.com';
    await request('http://localhost:5055/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ name: 'Test', email, password: 'pass' }));

    const login = await request('http://localhost:5055/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ email, password: 'pass' }));
    const token = JSON.parse(login.body).token;

    const boundary = '----Boundary';
    const pdf = fs.readFileSync('test.pdf');
    let body = Buffer.concat([
      Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="title"\r\n\r\nProject with Files\r\n'),
      Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="description"\r\n\r\nTest Desc\r\n'),
      Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="category"\r\n\r\nEngineering\r\n'),
      Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="batch"\r\n\r\n2025\r\n'),
      Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="techStack"\r\n\r\nNode.js\r\n'),
      Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="researchPaper"; filename="paper.pdf"\r\nContent-Type: application/pdf\r\n\r\n'),
      pdf,
      Buffer.from('\r\n--' + boundary + '\r\nContent-Disposition: form-data; name="presentation"; filename="slides.pdf"\r\nContent-Type: application/pdf\r\n\r\n'),
      pdf,
      Buffer.from('\r\n--' + boundary + '--\r\n')
    ]);

    const sub = await request('http://localhost:5055/api/projects', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'multipart/form-data; boundary=' + boundary, 'Content-Length': body.length }
    }, body);
    console.log('Final Submit Status:', sub.status);
    console.log('Final Submit Response:', sub.body);

    const list = await request('http://localhost:5055/api/projects', {
      method: 'GET', headers: { 'Authorization': 'Bearer ' + token }
    });
    const projects = JSON.parse(list.body);
    const myProject = projects.find(p => p.title === 'Project with Files');
    console.log('Project in List:', JSON.stringify(myProject, null, 2));

  } catch (e) { console.error(e); }
})();
