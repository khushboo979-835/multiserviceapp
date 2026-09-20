const fs = require('fs');
const path = require('path');

function scanDir(dir, matches = []) {
  if (!fs.existsSync(dir)) return matches;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === '.expo' || entry.name === '.next' || entry.name === 'build') continue;
      scanDir(full, matches);
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      if (entry.name.endsWith('.d.ts')) continue;
      try {
        const content = fs.readFileSync(full, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
          if (/(?:this\s*\.\s*#[a-zA-Z0-9_]+|^\s*#[a-zA-Z0-9_]+\s*[:=;(\[])/.test(line)) {
            matches.push({ file: full, line: idx + 1, content: trimmed });
          }
        });
      } catch (e) {}
    }
  }
  return matches;
}

const packages = [
  'node_modules/react-native-worklets/src',
  'node_modules/react-native-worklets/lib',
  'node_modules/react-native-reanimated/src',
  'node_modules/react-native-reanimated/lib'
];

for (const pkg of packages) {
  const matches = scanDir(pkg);
  console.log(`=== ${pkg} matches: ${matches.length} ===`);
  matches.forEach(m => console.log(`${m.file}:${m.line} -> ${m.content}`));
}
