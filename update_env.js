const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const envFiles = [
    path.join(rootDir, 'backend', '.env'),
    path.join(rootDir, 'backend', 'core', '.env'),
    path.join(rootDir, 'backend', 'erp', '.env')
];

envFiles.forEach(file => {
    console.log(`Checking ${file}...`);
    let content = '';
    if (fs.existsSync(file)) {
        content = fs.readFileSync(file, 'utf8');
        if (content.match(/^DB_NAME=/m)) {
            content = content.replace(/^DB_NAME=.*/m, 'DB_NAME=erp_ventes');
        } else {
            content += '\nDB_NAME=erp_ventes\n';
        }

        // Ensure standard connection params if not present
        if (!content.match(/^DB_HOST=/m)) content += 'DB_HOST=localhost\n';
        if (!content.match(/^DB_USER=/m)) content += 'DB_USER=root\n';
        if (!content.match(/^DB_PASSWORD=/m)) content += 'DB_PASSWORD=\n';

        fs.writeFileSync(file, content);
        console.log(`✅ Updated ${file}`);
    } else {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, 'DB_HOST=localhost\nDB_USER=root\nDB_PASSWORD=\nDB_NAME=erp_ventes\n');
        console.log(`✅ Created ${file}`);
    }
});
