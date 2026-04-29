const fs = require('fs');
const path = require('path');

const detailPath = path.join(__dirname, 'frontend', 'project-detail.html');
let content = fs.readFileSync(detailPath, 'utf8');

// Inject the script before document.addEventListener('DOMContentLoaded'
const scriptInsertion = `
    function isSuperAdmin(u) {
      if (!u || !u.email) return false;
      const email = u.email.toLowerCase().trim();
      const allowedEmails = [
        'swara.pratapwar24@pccoepune.org',
        'samrudhi.divekar24@pccoepune.org',
        'samrudhi.dhumal24@pccoepune.org',
        'admin@pccoepune.org',
        'admin@pccoe.org'
      ];
      return allowedEmails.includes(email);
    }

    async function deleteProject(id) {
      if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
      try {
        await apiCall(\`/api/projects/\${id}\`, { method: 'DELETE' });
        alert('Project deleted successfully.');
        window.location.href = 'explore.html';
      } catch(err) {
        alert('Failed to delete: ' + err.message);
      }
    }

    document.addEventListener('DOMContentLoaded'`;

content = content.replace(/document\.addEventListener\('DOMContentLoaded'/g, scriptInsertion.trim());

// Inject the delete button into the header
// We'll replace the RESEARCH PROJECT / ACTIVE badge section
const oldBadgeSec = /<div style="margin-bottom: 16px;">\s*<span class="badge badge-orange">RESEARCH PROJECT<\/span>\s*<span class="badge badge-green">ACTIVE<\/span>\s*<\/div>/;

const newBadgeSec = `<div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span class="badge badge-orange">RESEARCH PROJECT</span>
            <span class="badge badge-green">ACTIVE</span>
          </div>
          \${isSuperAdmin(checkAuth()) ? \`<button onclick="deleteProject('\${p.id}')" class="btn-primary" style="background: #DC2626; border-color: #DC2626; padding: 6px 12px; font-size: 0.85rem;">Delete Project</button>\` : ''}
        </div>`;

content = content.replace(oldBadgeSec, newBadgeSec);

// Fix the random </div> that was left behind from fix_detail.js
content = content.replace(/<\/div>\s*<\/div>\s*\$\{techStackHtml \?/, '</div>\n\n        ${techStackHtml ?');

fs.writeFileSync(detailPath, content, 'utf8');
console.log('Successfully injected delete button logic.');
