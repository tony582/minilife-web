const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const Parser = acorn.Parser.extend(jsx());
const content = fs.readFileSync('src/App.jsx', 'utf8');

try {
    Parser.parse(content, { sourceType: 'module', ecmaVersion: 2020 });
    console.log("Parse successful!");
} catch (e) {
    console.log("Parse error:", e);
}
