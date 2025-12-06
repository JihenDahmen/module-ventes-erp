const db = require('./src/config/db');

async function inspect() {
    try {
        console.log('--- Tables in erp_sales_db ---');
        const [rows] = await db.query('SHOW TABLES');
        console.log(rows);

        if (rows.length > 0) {
            const tableName = Object.values(rows[0])[0]; // Get first table name
            // List all tables content
            for (const row of rows) {
                const tName = Object.values(row)[0];
                console.log(`\nDesc table: ${tName}`);
                const [cols] = await db.query(`DESCRIBE ${tName}`);
                console.log(cols.map(c => c.Field));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

inspect();
