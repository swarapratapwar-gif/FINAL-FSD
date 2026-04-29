const fs = require('fs');
const path = require('path');

// 1. Update frontend/project-detail.html
const detailPath = path.join(__dirname, 'frontend', 'project-detail.html');
let detailHtml = fs.readFileSync(detailPath, 'utf8');

const targetDetailScript = `    document.addEventListener('DOMContentLoaded', async () => {
      const urlParams = new URLSearchParams(window.location.search);`;

const replacementDetailScript = `    function isSuperAdmin(u) {
      if (!u || !u.name) return false;
      const name = u.name.toLowerCase().trim();
      return name === 'swara pratapwar' || name === 'samrudhi divekar' || name === 'samrudhi dhumal' || name.includes('admin');
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

    document.addEventListener('DOMContentLoaded', async () => {
      const urlParams = new URLSearchParams(window.location.search);`;

detailHtml = detailHtml.replace(targetDetailScript, replacementDetailScript);

const targetBadgeHtml = `<div style="margin-bottom: 16px;">
          <span class="badge badge-orange">RESEARCH PROJECT</span>
          <span class="badge badge-green">ACTIVE</span>
        </div>`;

const replacementBadgeHtml = `<div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span class="badge badge-orange">RESEARCH PROJECT</span>
            <span class="badge badge-green">ACTIVE</span>
          </div>
          \${isSuperAdmin(checkAuth()) ? \`<button onclick="deleteProject('\${p.id}')" class="btn-primary" style="background: #DC2626; border-color: #DC2626; padding: 6px 12px; font-size: 0.85rem;">Delete Project</button>\` : ''}
        </div>`;

detailHtml = detailHtml.replace(targetBadgeHtml, replacementBadgeHtml);
fs.writeFileSync(detailPath, detailHtml, 'utf8');

// 2. Update backend/routes/projects.js
const projPath = path.join(__dirname, 'backend', 'routes', 'projects.js');
let projJs = fs.readFileSync(projPath, 'utf8');

const targetDelete = `// DELETE /api/projects/:id — admin only
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }`;

const replacementDelete = `// DELETE /api/projects/:id — specific admins only
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userName = (req.user.name || '').toLowerCase().trim();
    const isAllowed = userName === 'swara pratapwar' || userName === 'samrudhi divekar' || userName === 'samrudhi dhumal' || userName.includes('admin');
    
    if (!isAllowed) {
      return res.status(403).json({ message: 'You do not have permission to delete projects.' });
    }`;

projJs = projJs.replace(targetDelete, replacementDelete);
fs.writeFileSync(projPath, projJs, 'utf8');

console.log('Updated auth delete logic.');
