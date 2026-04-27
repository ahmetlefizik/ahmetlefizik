const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove bg-card/80 backdrop-blur-sm and replace with bg-card shadow-sm
    content = content.replace(/bg-card\/80 backdrop-blur-sm/g, 'bg-card shadow-sm');
    
    // Remove the annoying gradient div lines completely
    content = content.replace(/<div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br[^>]*><\/div>\s*/g, '');
    content = content.replace(/<div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br[^>]* \/>\s*/g, '');
    
    fs.writeFileSync(filePath, content);
  }
});
console.log("Cleanup done.");
