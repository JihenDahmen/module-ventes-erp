const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('Testing connection to:', process.env.DB_NAME);
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('Successfully connected to database.');

        const [rows] = await connection.execute('SELECT count(*) as count FROM ventes');
        console.log('Ventes table row count:', rows[0].count);

        await connection.end();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}

testConnection();
