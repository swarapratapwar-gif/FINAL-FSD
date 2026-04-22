const fs = require("fs");
const FormData = require("form-data");
const http = require("http");

const testPdfContent = "%PDF-1.1\n%test\n%%EOF";
fs.writeFileSync("test_paper.pdf", testPdfContent);
fs.writeFileSync("test_presentation.pdf", testPdfContent);

async function runTest() {
  try {
    const email = `testuser${Date.now()}@example.com`;
    
    // Step 1: Register
    console.log("Step 1: Registering user...");
    const registerResponse = await makeRequest("POST", "/api/auth/register", {
      name: "Test User",
      email: email,
      password: "password123"
    });
    console.log("Register Status:", registerResponse.statusCode);
    const registerData = JSON.parse(registerResponse.body);
    
    // Step 2: Login
    console.log("\nStep 2: Logging in...");
    const loginResponse = await makeRequest("POST", "/api/auth/login", {
      email: email,
      password: "password123"
    });
    console.log("Login Status:", loginResponse.statusCode);
    const loginData = JSON.parse(loginResponse.body);
    const token = loginData.token;
    console.log("Token received:", token ? "YES" : "NO");

    // Step 3: Upload
    console.log("\nStep 3: Submitting project with files...");
    const form = new FormData();
    form.append("title", "Test Research Project");
    form.append("description", "This is a test project with PDF uploads");
    form.append("techStack", "Node.js, Express");
    form.append("batch", "2024");
    form.append("github", "https://github.com/test");
    form.append("linkedin", "https://linkedin.com/test");
    form.append("researchPaper", fs.createReadStream("test_paper.pdf"), {
      filename: "test_paper.pdf",
      contentType: "application/pdf"
    });
    form.append("presentation", fs.createReadStream("test_presentation.pdf"), {
      filename: "test_presentation.pdf",
      contentType: "application/pdf"
    });

    const options = {
      hostname: "localhost",
      port: 5055,
      path: "/api/projects",
      method: "POST",
      headers: {
        ...form.getHeaders(),
        "Authorization": `Bearer ${token}`
      }
    };

    const uploadPromise = new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode, body }));
      });
      req.on("error", (err) => reject(err));
      form.pipe(req);
    });

    const uploadRes = await uploadPromise;
    console.log("Upload Status:", uploadRes.statusCode);
    console.log("Upload Response:", uploadRes.body);

    if (uploadRes.statusCode === 201) {
      console.log("\n? SUCCESS! Project created with files");
    } else {
      console.log("\n? FAILED! Status:", uploadRes.statusCode);
    }
  } catch (err) {
    console.error("Error during test:", err.message);
  }
}

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: "localhost",
      port: 5055,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on("error", (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

runTest();
