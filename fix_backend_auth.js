const fs = require('fs');
const path = require('path');

const projPath = path.join(__dirname, 'backend', 'routes', 'projects.js');
let projJs = fs.readFileSync(projPath, 'utf8');

const targetStr = /if\s*\(\s*req\.user\.role\s*!==\s*'admin'\s*\)\s*\{\s*return\s*res\.status\(403\)\.json\(\{\s*message:\s*'Admin\s*access\s*required'\s*\}\);\s*\}/;

const replacementStr = `const userEmail = (req.user.email || '').toLowerCase().trim();
    const allowedEmails = [
      'swara.pratapwar24@pccoepune.org',
      'samrudhi.divekar24@pccoepune.org',
      'samrudhi.dhumal24@pccoepune.org',
      'admin@pccoepune.org',
      'admin@pccoe.org'
    ];
    if (!allowedEmails.includes(userEmail)) {
      return res.status(403).json({ message: 'You do not have permission to delete projects.' });
    }`;

projJs = projJs.replace(targetStr, replacementStr);
fs.writeFileSync(projPath, projJs, 'utf8');
console.log('Fixed backend auth.');
