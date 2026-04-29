const fs = require('fs');
const path = require('path');
function fixEscapedTemplateLiterals(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules') fixEscapedTemplateLiterals(fullPath);
        } else if (file.endsWith('.html') || file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
            if (content !== updated) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log('Fixed ' + fullPath);
            }
        }
    }
}
fixEscapedTemplateLiterals('./frontend');
