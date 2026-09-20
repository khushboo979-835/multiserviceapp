const fs = require('fs');
const path = require('path');

const corrupted = [];

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name === '.git' || item.name === '.next') continue;
      scan(p);
    } else if (item.name.endsWith('.js') || item.name.endsWith('.ts')) {
      try {
        const text = fs.readFileSync(p, 'utf8');
        if (/class\s+\w+[^{]*\{\s*_\s*;\s*_\s*;/m.test(text) || /\bthis\._\s*=\s*projectRoot\b/.test(text) || /\bthis\._\s*=\s*new URL\b/.test(text)) {
          corrupted.push(p);
        }
      } catch (e) {}
    }
  }
}

scan('node_modules');
console.log('Total corrupted files found:', corrupted.length);
corrupted.forEach(c => console.log(' ->', c));
