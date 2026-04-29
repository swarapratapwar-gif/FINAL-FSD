const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5055;
const HOST = '127.0.0.1';

async function request(options, data, isMultipart = false, boundary = '') {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: body }));
        });
        req.on('error', reject);
        if (data) {
            if (isMultipart) {
                req.write(data);
            } else {
                req.write(JSON.stringify(data));
            }
        }
        req.end();
    });
}

function createMultipartBody(fields, files, boundary) {
    let body = Buffer.alloc(0);
    for (const [key, value] of Object.entries(fields)) {
        body = Buffer.concat([
            body,
            Buffer.from(--\\r\nContent-Disposition: form-data; name="\"\r\n\r\n\\r\n)
        ]);
    }
    for (const [key, file] of Object.entries(files)) {
        body = Buffer.concat([
            body,
            Buffer.from(--\\r\nContent-Disposition: form-data; name="\"; filename="\"\r\nContent-Type: application/pdf\r\n\r\n),
            file.content,
            Buffer.from('\r\n')
        ]);
    }
    body = Buffer.concat([body, Buffer.from(--\--\r\n)]);
    return body;
}

async function runTest() {
    try {
        console.log('--- Registering ---');
        const email = 'test' + Date.now() + '@example.com';
        const regRes = await request({
            hostname: HOST, port: PORT, path: '/api/auth/register', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { name: 'Tester', email: email, password: 'password123' });
        console.log('Register Status:', regRes.statusCode);
        console.log('Register Body:', regRes.body);

        console.log('--- Logging in ---');
        const loginRes = await request({
            hostname: HOST, port: PORT, path: '/api/auth/login', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: email, password: 'password123' });
        console.log('Login Status:', loginRes.statusCode);
        const loginBody = JSON.parse(loginRes.body);
        const token = loginBody.token;

        console.log('--- Submitting Project ---');
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const fields = {
            title: 'Test Project',
            description: 'Test Description',
            techStack: 'Node, Express',
            batch: '2024'
        };
        const files = {
            researchPaper: { name: 'paper.pdf', content: Buffer.from('%PDF-1.4\n%Test Paper') },
            presentation: { name: 'presentation.pdf', content: Buffer.from('%PDF-1.4\n%Test Presentation') }
        };
        const body = createMultipartBody(fields, files, boundary);

        const projectRes = await request({
            hostname: HOST, port: PORT, path: '/api/projects', method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'Content-Length': body.length
            }
        }, body, true, boundary);
        console.log('Project Status:', projectRes.statusCode);
        console.log('Project Body:', projectRes.body);

        if (projectRes.statusCode === 201) {
            console.log('SUCCESS: Project created');
        } else {
            console.log('FAILURE: Project not created');
            process.exit(1);
        }
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}

runTest();
