const fs = require('fs');
const path = require('path');

function replaceFontsInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules') replaceFontsInDir(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content.replace(/<link[^>]*href=["']https:\/\/fonts\.googleapis\.com[^>]*>/gi, '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">');
            
            // Also replace font-family directly in style tags if they exist
            updated = updated.replace(/font-family:\s*['"]?(DM Sans|Poppins|Merriweather)['"]?/gi, 'font-family: \'Inter\'');
            updated = updated.replace(/font-family:\s*['"]?(Syne)['"]?/gi, 'font-family: \'Outfit\'');
            
            if (content !== updated) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log('Updated ' + fullPath);
            }
        }
    }
}
replaceFontsInDir('./frontend');
