const db = require('./src/config/db');

async function cleanup() {
    try {
        console.log('--- Dropping temporary tables ---');
        await db.query('DROP TABLE IF EXISTS ventes');
        await db.query('DROP TABLE IF EXISTS devis');
        await db.query('DROP TABLE IF EXISTS commandes');
        console.log('Tables dropped successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error dropping tables:', error);
        process.exit(1);
    }
}

cleanup();
