const fs = require('fs');

const content = fs.readFileSync('src/components/common/GlobalModals.jsx', 'utf8');
const contextLine = content.split('    } = context;')[0].split('const {')[1];
const varsInContext = contextLine.split(',').map(s => s.trim()).filter(Boolean);

const appContent = fs.readFileSync('src/App.jsx', 'utf8');

const missingVars = [];
for (const v of varsInContext) {
    if (!appContent.includes(\` \${v} \`) && !appContent.includes(\`\${v},\`) && !appContent.includes(\`const [\${v}\`)) {
        if (v.startsWith('set')) continue; // Skip setters for now, let's find get
        missingVars.push(v);
    }
}
console.log("Missing Variables passing to context:", missingVars);
