const fs = require('fs');
const path = require('path');

const detailHtmlPath = path.join(__dirname, 'frontend', 'project-detail.html');
let content = fs.readFileSync(detailHtmlPath, 'utf8');

const targetHtml = `<div style="margin-bottom: 16px;">
          <span class="badge badge-orange">RESEARCH PROJECT</span>
          <span class="badge badge-green">ACTIVE</span>
          <p><strong>Researchers:</strong> \${escapeHtml(p.teamMembers || p.submittedByName)}</p>
          <p><strong>Uploaded By:</strong> \${escapeHtml(p.submittedByName)}</p>
        </div>`;

const replacementHtml = `<div style="margin-bottom: 16px;">
          <span class="badge badge-orange">RESEARCH PROJECT</span>
          <span class="badge badge-green">ACTIVE</span>
        </div>

        <h1 style="font-size: 2rem; margin-bottom: 8px;">\${escapeHtml(p.title)}</h1>
        <p style="color: #6B7280; margin-bottom: 24px;">CSE AI&ML Department, PCCOE • Guide: \${escapeHtml(p.guideName)}</p>

        <div class="card" style="margin-bottom: 32px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 12px; border-bottom: 1px solid #F3F4F6; padding-bottom: 12px;">Team Information</h3>
          <p><strong>Researchers:</strong> \${escapeHtml(p.teamMembers || p.submittedByName)}</p>
          <p><strong>Uploaded By:</strong> \${escapeHtml(p.submittedByName)}</p>
          <p><strong>Batch / Year:</strong> \${escapeHtml(p.batch)} / \${escapeHtml(p.year)}</p>
        </div>

        <div style="margin-bottom: 32px;">
          <h3 style="font-size: 1.25rem; margin-bottom: 12px;">Abstract / Overview</h3>
          <div style="line-height: 1.8; color: #374151;">\${escapeHtml(p.description).replace(/\\\\n/g, '<br>')}</div>
        </div>`;

content = content.replace(targetHtml, replacementHtml);

fs.writeFileSync(detailHtmlPath, content, 'utf8');
console.log('Fixed project-detail.html');
