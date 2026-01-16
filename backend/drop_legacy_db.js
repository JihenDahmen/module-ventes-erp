const mysql = require('mysql2/promise');
require('dotenv').config();

async function dropLegacyDb() {
    console.log('--- ATTEMPTING TO DROP LEGACY DATABASE erp_sales_db ---');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        console.log('1. Connected to MySQL.');
        console.log('2. Dropping database erp_sales_db if it exists...');
        await connection.query('DROP DATABASE IF EXISTS erp_sales_db');

        console.log('✅ Legacy database erp_sales_db dropped successfully!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ FAILED TO DROP DATABASE:', error.message);
        process.exit(1);
    }
}

dropLegacyDb();
