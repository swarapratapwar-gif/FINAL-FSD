const fs = require('fs');
const path = require('path');
const dir = './frontend';

const unifiedHeader = `<header class="site-topbar" style="background: #0B0F19; border-bottom: 1px solid rgba(255,255,255,0.05); height: 64px; display: flex; align-items: center; padding: 0 40px; justify-content: space-between;">
  <div style="display: flex; align-items: center; gap: 12px; width: 300px;">
    <div class="brand-mark" style="background: #E8500A; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; color: white; font-size: 0.8rem;">🎓</div>
    <div class="brand-title" style="color: white; font-weight: 800; font-size: 1.2rem; font-family: 'Outfit', sans-serif;">EduAchieve</div>
  </div>
  <nav class="top-nav" style="display: flex; gap: 32px; justify-content: center; flex: 1;">
    <a href="index.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.95rem; font-family: 'Inter', sans-serif; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#FFF'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Home</a>
    <a href="explore.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.95rem; font-family: 'Inter', sans-serif; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#FFF'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Projects</a>
    <a href="submit.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.95rem; font-family: 'Inter', sans-serif; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#FFF'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Submit</a>
    <a href="about.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.95rem; font-family: 'Inter', sans-serif; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#FFF'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">About</a>
  </nav>
  <div class="nav-actions" style="display: flex; align-items: center; gap: 16px; width: 300px; justify-content: flex-end;">
    <a href="login.html" class="btn-primary" id="navLogin" style="background: #E8500A; color: white; padding: 8px 20px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 600; font-family: 'Inter', sans-serif;">Login</a>
    <span class="nav-username" id="navUser" style="color: white; font-size: 0.85rem; font-family: 'Inter', sans-serif;"></span>
    <button id="navLogout" style="display: none; background: none; border: none; color: #F87171; cursor: pointer; font-size: 0.85rem; font-weight: 600; font-family: 'Inter', sans-serif;" onclick="logout()">Logout</button>
  </div>
</header>`;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Note: some files might have search boxes inside the header, so we need a broader regex
  // to grab everything from <header class="site-topbar"> to </header>
  const newContent = content.replace(/<header class="site-topbar"[\s\S]*?<\/header>/, unifiedHeader);
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Updated ' + f);
  }
});
