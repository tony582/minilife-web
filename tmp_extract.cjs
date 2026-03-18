const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf-8');

// Match useState
const stateRegex = /const \[([a-zA-Z0-9_]+), set([a-zA-Z0-9_]+)\] = useState/g;
const states = [];
let match;
while ((match = stateRegex.exec(content)) !== null) {
    if (!states.includes(match[1])) {
        states.push(match[1]);
        states.push('set' + match[2]);
    }
}

// Match things from hooks: const { a, b, c } = useAuth(...)
const hooksRegex = /const\s+\{([^}]+)\}\s*=\s*use[A-Z][a-zA-Z0-9_]*\(/g;
while ((match = hooksRegex.exec(content)) !== null) {
    const vars = match[1].split(',').map(s => s.trim().split(':')[0].trim()).filter(s => s && !s.includes('...') && s !== 'tasks'); // avoid dup tasks and spread
    vars.forEach(v => {
        if (!states.includes(v)) states.push(v);
    });
}

// Other important functions defined at top level
const funcs = ['handleStartTask', 'handleContinueTask', 'confirmSubmitTask', 'confirmTransfer', 'handleTaskApproval', 'startTimer', 'pauseTimer', 'resetTimer', 'closeTimer', 'toggleTimerMode', 'handleDeleteTask', 'buyItem', 'handleAuth', 'handleLogout', 'handleRedeem', 'generateCodes'];
funcs.forEach(f => {
    if (!states.includes(f)) states.push(f);
});

console.log(states.join(', '));
