const fs = require('fs');
const path = require('path');

// 1. Update frontend/project-detail.html
const detailPath = path.join(__dirname, 'frontend', 'project-detail.html');
let detailHtml = fs.readFileSync(detailPath, 'utf8');

const targetDetailScript = `    function isSuperAdmin(u) {
      if (!u || !u.name) return false;
      const name = u.name.toLowerCase().trim();
      return name === 'swara pratapwar' || name === 'samrudhi divekar' || name === 'samrudhi dhumal' || name.includes('admin');
    }`;

const replacementDetailScript = `    function isSuperAdmin(u) {
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
    }`;

detailHtml = detailHtml.replace(targetDetailScript, replacementDetailScript);
fs.writeFileSync(detailPath, detailHtml, 'utf8');

// 2. Update backend/routes/projects.js
const projPath = path.join(__dirname, 'backend', 'routes', 'projects.js');
let projJs = fs.readFileSync(projPath, 'utf8');

const targetDelete = `// DELETE /api/projects/:id — specific admins only
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userName = (req.user.name || '').toLowerCase().trim();
    const isAllowed = userName === 'swara pratapwar' || userName === 'samrudhi divekar' || userName === 'samrudhi dhumal' || userName.includes('admin');`;

const replacementDelete = `// DELETE /api/projects/:id — specific admins only
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const allowedEmails = [
      'swara.pratapwar24@pccoepune.org',
      'samrudhi.divekar24@pccoepune.org',
      'samrudhi.dhumal24@pccoepune.org',
      'admin@pccoepune.org',
      'admin@pccoe.org'
    ];
    const isAllowed = allowedEmails.includes(userEmail);`;

projJs = projJs.replace(targetDelete, replacementDelete);
fs.writeFileSync(projPath, projJs, 'utf8');

console.log('Updated auth delete logic to use emails.');
