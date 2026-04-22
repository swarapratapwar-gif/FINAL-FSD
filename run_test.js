const http = require('http');

async function test() {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const email = 'test' + Date.now() + '@example.com';
    
    const post = (path, data, headers = {}) => new Promise((resolve, reject) => {
        const req = http.request({ hostname: '127.0.0.1', port: 5055, path, method: 'POST', headers: { 'Content-Type': 'application/json', ...headers } }, (res) => {
            let body = ''; 
            res.on('data', c => body += c); 
            res.on('end', () => {
                try { resolve({ s: res.statusCode, b: JSON.parse(body) }); }
                catch(e) { resolve({ s: res.statusCode, b: body }); }
            });
        });
        req.on('error', reject);
        if (Buffer.isBuffer(data)) req.write(data);
        else req.write(JSON.stringify(data));
        req.end();
    });

    try {
        console.log('Registering...');
        const r1 = await post('/api/auth/register', { name: 'Tester', email, password: 'password123' });
        console.log('Register Status:', r1.s);

        console.log('Logging in...');
        const r2 = await post('/api/auth/login', { email, password: 'password123' });
        console.log('Login Status:', r2.s);
        const token = r2.b.token;

        console.log('Submitting project...');
        const fields = { 
            title: 'Test Project Title', 
            description: 'Test Description content', 
            techStack: 'NodeJS, Express', 
            batch: '2024' 
        };
        let bodyParts = [];
        for (const [k, v] of Object.entries(fields)) {
            bodyParts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`));
        }
        bodyParts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="researchPaper"; filename="paper.pdf"\r\nContent-Type: application/pdf\r\n\r\n`));
        bodyParts.push(Buffer.from('%PDF-1.4\n%Test Paper File Content\n'));
        bodyParts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
        
        const body = Buffer.concat(bodyParts);

        const r3 = await post('/api/projects', body, { 
            'Authorization': 'Bearer ' + token, 
            'Content-Type': 'multipart/form-data; boundary=' + boundary,
            'Content-Length': body.length
        });
        console.log('Project Status:', r3.s);
        console.log('Project Response:', JSON.stringify(r3.b));
        
        if (r3.s === 201) {
            console.log('TEST PASSED');
        } else {
            console.log('TEST FAILED');
        }
    } catch (e) { console.error('Error during test:', e); }
}
test();
