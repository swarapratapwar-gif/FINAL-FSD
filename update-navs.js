const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');
const files = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));

const standardNavLinks = `
    <nav class="nav-links">
      <a href="index.html">Home</a>
      <a href="explore.html">Explore</a>
      <a href="about.html">About</a>
      <a href="assignments/index.html">Assignments</a>
      <a href="admin.html" id="navAdmin" style="display: none;">Admin</a>
    </nav>
`;

// Also standardize top-actions
const standardTopActions = `
    <div class="top-actions">
      <button id="themeToggle" class="theme-toggle" aria-label="Toggle dark mode"></button>
      <a href="login.html" class="btn btn-outline" id="navLoginBtn">Portal Access</a>
      <div class="user-dropdown" id="navUserDropdown" style="display: none;">
        <span id="navUserName" class="user-name"></span>
        <button id="navLogout" class="btn btn-danger btn-sm">Logout</button>
      </div>
    </div>
`;

files.forEach(file => {
  const filePath = path.join(frontendDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace nav-links block
  content = content.replace(/<nav class="nav-links">[\s\S]*?<\/nav>/, standardNavLinks.trim());
  
  // Replace top-actions block
  content = content.replace(/<div class="top-actions">[\s\S]*?<\/div>\s*<\/header>/, standardTopActions.trim() + '\n  </header>');

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Updated navs in all html files.');
