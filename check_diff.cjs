const fs = require('fs');

const oldLines = fs.readFileSync('tmp_old_states.txt', 'utf8').split('\n');
const appContent = fs.readFileSync('src/App.jsx', 'utf8');

const missing = [];
for (let line of oldLines) {
    if (!line.trim()) continue;
    const match = line.match(/const \[([a-zA-Z0-9]+)/);
    if (match) {
        const stateName = match[1];
        if (!appContent.includes(\`const [\${stateName}\`)) {
            missing.push(line.trim());
        }
    }
}

console.log("Missing States:");
console.log(missing.join('\n'));
