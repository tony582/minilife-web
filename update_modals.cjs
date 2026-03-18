const fs = require('fs');

let code = fs.readFileSync('src/components/common/GlobalModals.jsx', 'utf8');

// Replace imports
code = code.replace(
    'import { useAppContext } from \\'../../context/AppContext\\';',
    `import { useAuthContext } from '../../context/AuthContext';\nimport { useDataContext } from '../../context/DataContext';\nimport { useUIContext } from '../../context/UIContext';\nimport { useTaskManager } from '../../hooks/useTaskManager';\nimport { useShopManager } from '../../hooks/useShopManager';`
);

// Replace context consumption
code = code.replace(
    'const context = useAppContext();',
    `const authC = useAuthContext();
    const dataC = useDataContext();
    const uiC = useUIContext();
    const taskM = useTaskManager(authC, dataC, uiC);
    const shopM = useShopManager(authC, dataC, uiC);
    const context = { ...authC, ...dataC, ...uiC, ...taskM, ...shopM };`
);

fs.writeFileSync('src/components/common/GlobalModals.jsx', code);
console.log('GlobalModals updated to use new contexts.');
