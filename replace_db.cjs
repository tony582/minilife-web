const fs = require('fs');
let code = fs.readFileSync('server/database.js', 'utf8');

code = code.replace(/\/\/ ─── Auto-Migrate schema changes ───[\s\S]+?\}\n\}/m, `// ─── Auto-Migrate schema changes ───
async function executeCreateTable(client, sql) {
    await client.query(sql);
    const match = sql.match(/CREATE TABLE IF NOT EXISTS "?([a-z_]+)"?\\s*\\(([\\s\\S]*?)\\)/i);
    if (!match) return;
    const tableName = match[1];
    const columnsText = match[2];
    const colLines = columnsText.split(/\\r?\\n/);
    for (let line of colLines) {
        line = line.trim();
        if (!line || line.toUpperCase().startsWith("UNIQUE") || line.toUpperCase().startsWith("PRIMARY KEY") || line.toUpperCase().startsWith("FOREIGN KEY")) continue;
        if (line.endsWith(",")) line = line.substring(0, line.length - 1).trim();
        
        const colMatch = line.match(/^"?([a-z_]+)"?\\s+(.+)/i);
        if (colMatch) {
            if (colMatch[2].toUpperCase().includes("PRIMARY KEY")) continue;
            const colName = colMatch[1];
            let definition = colMatch[2];
            definition = definition.replace(/NOT NULL/gi, "").trim();
            try {
                await client.query(\`ALTER TABLE \${tableName} ADD COLUMN IF NOT EXISTS \${colName} \${definition}\`);
            } catch (e) {
                console.warn(\`[Auto-Migrate] Warning for \${tableName}.\${colName}:\`, e.message);
            }
        }
    }
}`);

code = code.replace(/await client\.query\(\s*`CREATE TABLE IF NOT EXISTS/g, 'await executeCreateTable(client, `CREATE TABLE IF NOT EXISTS');

fs.writeFileSync('server/database.js', code);
