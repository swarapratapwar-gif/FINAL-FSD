const http = require('http');
const PORT = 5055;
const HOST = '127.0.0.1';

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: body }));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function runTest() {
    try {
        const email = `testuser${Date.now()}@example.com`;
        const regData = JSON.stringify({ name: 'Test User', email, password: 'password123' });
        const regRes = await request({
            hostname: HOST, port: PORT, path: '/api/auth/register', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(regData) }
        }, regData);
        const token = JSON.parse(regRes.body).token;

        const boundary = '----Boundary';
        const pdfContent = '%PDF-1.4\n%test';
        let body = `--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nTest Project Title\r\n` +
                   `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nTest Description\r\n` +
                   `--${boundary}\r\nContent-Disposition: form-data; name="techStack"\r\n\r\nNode.js\r\n` +
                   `--${boundary}\r\nContent-Disposition: form-data; name="batch"\r\n\r\n2024\r\n` +
                   `--${boundary}\r\nContent-Disposition: form-data; name="researchPaper"; filename="p.pdf"\r\nContent-Type: application/pdf\r\n\r\n${pdfContent}\r\n` +
                   `--${boundary}\r\nContent-Disposition: form-data; name="presentation"; filename="s.pdf"\r\nContent-Type: application/pdf\r\n\r\n${pdfContent}\r\n` +
                   `--${boundary}--\r\n`;

        await request({
            hostname: HOST, port: PORT, path: '/api/projects', method: 'POST',
            headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Authorization': `Bearer ${token}`, 'Content-Length': Buffer.byteLength(body) }
        }, body);

        const listRes = await request({
            hostname: HOST, port: PORT, path: '/api/projects', method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const projects = JSON.parse(listRes.body);
        const project = projects.find(p => p.title === "Test Project Title");
        console.log('Project Details:', JSON.stringify(project, null, 2));

        for (const field of ['researchPaper', 'presentation']) {
            if (project[field]) {
                const url = project[field].startsWith('/') ? project[field] : `/uploads/${project[field]}`;
                const dlRes = await request({ hostname: HOST, port: PORT, path: url, method: 'GET' });
                console.log(`GET ${url} Status:`, dlRes.statusCode);
            }
        }
    } catch (err) { console.error('ERROR:', err); }
}
runTest();
