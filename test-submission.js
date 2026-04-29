const http = require('http');
const fs = require('fs');
const path = require('path');

const request = (hostname, port, path, method, headers, postData) => {
    return new Promise((resolve, reject) => {
        const req = http.request({ hostname, port, path, method, headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
};

(async () => {
    try {
        const email = 'test' + Date.now() + '@example.com';
        const password = 'password123';
        
        const regRes = await request('127.0.0.1', 5055, '/api/auth/register', 'POST', { 'Content-Type': 'application/json' }, JSON.stringify({ name: 'Test User', email, password }));
        console.log('Register Status:', regRes.statusCode);

        const loginRes = await request('127.0.0.1', 5055, '/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, JSON.stringify({ email, password }));
        console.log('Login Status:', loginRes.statusCode);
        const { token } = JSON.parse(loginRes.body);

        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const files = [
            { name: 'researchPaper', filename: 'research.pdf', path: 'research.pdf' },
            { name: 'presentation', filename: 'presentation.pdf', path: 'presentation.pdf' }
        ];

        let chunks = [];
        const fields = { title: 'Test Project', description: 'Testing', techStack: 'Node', batch: '2024' };
        for (const [key, val] of Object.entries(fields)) {
            chunks.push(Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name=\"' + key + '\"\r\n\r\n' + val + '\r\n'));
        }
        for (const file of files) {
            chunks.push(Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name=\"' + file.name + '\"; filename=\"' + file.filename + '\"\r\nContent-Type: application/pdf\r\n\r\n'));
            chunks.push(fs.readFileSync(file.path));
            chunks.push(Buffer.from('\r\n'));
        }
        chunks.push(Buffer.from('--' + boundary + '--\r\n'));
        const body = Buffer.concat(chunks);

        const res = await request('127.0.0.1', 5055, '/api/projects', 'POST', {
            'Content-Type': 'multipart/form-data; boundary=' + boundary,
            'Authorization': 'Bearer ' + token,
            'Content-Length': body.length
        }, body);
        console.log('Project Status:', res.statusCode);
        console.log('Project Response:', res.body);
    } catch (e) {
        console.error('Error:', e);
    }
})();
