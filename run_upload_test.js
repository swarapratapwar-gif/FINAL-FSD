const fs = require('fs');
const FormData = require('form-data');
const http = require('http');

async function testUpload() {
  const form = new FormData();
  form.append('title', 'Test API Title');
  form.append('domain', 'AI/ML');
  form.append('batch', '2024-25');
  form.append('year', '3rd Year');
  form.append('description', 'Test Description');
  
  // Create a dummy PDF
  fs.writeFileSync('test_dummy.pdf', '%PDF-1.4\n% dummy content');
  form.append('researchPaper', fs.createReadStream('test_dummy.pdf'));
  
  // Login first to get token
  const loginData = JSON.stringify({ email: 'swara.pratapwar24@pccoepune.org', password: 'password123' }); // Try to get a valid token. If it fails, maybe use admin.
  // Actually let's just create a token. Wait, JWT_SECRET is in .env. Let's just login as admin.
  
  const req = http.request('http://localhost:5055/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
  }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
          const json = JSON.parse(body);
          if (!json.token) {
              console.log('Login failed:', json);
              return;
          }
          
          const token = json.token;
          
          form.submit({
              host: 'localhost',
              port: 5055,
              path: '/api/projects',
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          }, function(err, res) {
              if (err) {
                  console.error(err);
                  return;
              }
              console.log('STATUS:', res.statusCode);
              let resBody = '';
              res.on('data', d => resBody += d);
              res.on('end', () => {
                  console.log('BODY:', resBody);
              });
          });
      });
  });
  
  req.write(JSON.stringify({ email: 'admin@pccoepune.org', password: 'Admin@1234' }));
  req.end();
}

testUpload();
