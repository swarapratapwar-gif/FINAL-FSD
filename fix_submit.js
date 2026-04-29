const fs = require('fs');
const path = require('path');

const submitHtmlPath = path.join(__dirname, 'frontend', 'submit.html');
let content = fs.readFileSync(submitHtmlPath, 'utf8');

const targetFormHtml = `<div class="form-group">
          <label>Research Abstract / Description</label>`;

const replacementFormHtml = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
          <div class="form-group">
            <label>Team Name (Optional)</label>
            <input type="text" id="teamName" placeholder="e.g. Innovators">
          </div>
          <div class="form-group">
            <label>Guide Name (Optional)</label>
            <input type="text" id="guideName" placeholder="e.g. Prof. Smith">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
          <div class="form-group">
            <label>GitHub Link (Optional)</label>
            <input type="url" id="githubLink" placeholder="https://github.com/...">
          </div>
          <div class="form-group">
            <label>LinkedIn Link (Optional)</label>
            <input type="url" id="linkedinLink" placeholder="https://linkedin.com/in/...">
          </div>
        </div>

        <div class="form-group">
          <label>Research Abstract / Description</label>`;

content = content.replace(targetFormHtml, replacementFormHtml);

const targetFileInput = `<input type="file" id="fileUpload" accept=".pdf,.ppt,.pptx">`;
const replacementFileInput = `<input type="file" id="fileUpload" accept=".pdf" required>`;
content = content.replace(targetFileInput, replacementFileInput);

// Replace form submission script
const targetScript = `      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
          title: document.getElementById('title').value,
          domain: document.getElementById('domain').value,
          batch: document.getElementById('batch').value,
          year: document.getElementById('year').value,
          description: desc.value
        };

        try {
          const res = await apiCall('/api/projects', {
            method: 'POST',
            body: formData
          });
          alert('Project submitted successfully!');
          window.location.href = 'my-profile.html';
        } catch (err) {
          alert('Error: ' + err.message);
        }
      });`;

const replacementScript = `      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('fileUpload');
        if (!fileInput.files[0]) {
          alert('Please select a research paper file to upload.');
          return;
        }

        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('domain', document.getElementById('domain').value);
        formData.append('batch', document.getElementById('batch').value);
        formData.append('year', document.getElementById('year').value);
        formData.append('description', desc.value);
        formData.append('researchPaper', fileInput.files[0]);

        // Optional fields
        const teamName = document.getElementById('teamName')?.value.trim();
        if (teamName) formData.append('teamName', teamName);

        const guideName = document.getElementById('guideName')?.value.trim();
        if (guideName) formData.append('guideName', guideName);

        const githubLink = document.getElementById('githubLink')?.value.trim();
        if (githubLink) formData.append('githubLink', githubLink);

        const linkedinLink = document.getElementById('linkedinLink')?.value.trim();
        if (linkedinLink) formData.append('linkedinLink', linkedinLink);

        try {
          const res = await apiCall('/api/projects', {
            method: 'POST',
            body: formData,
            isFormData: true
          });
          alert('Project submitted successfully!');
          window.location.href = 'explore.html';
        } catch (err) {
          alert('Error: ' + err.message);
        }
      });`;

content = content.replace(targetScript, replacementScript);

fs.writeFileSync(submitHtmlPath, content, 'utf8');
console.log('Fixed submit.html');
