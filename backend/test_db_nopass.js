const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('Testing connection with EMPTY password...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: '', // Force empty password
            database: process.env.DB_NAME
        });
        console.log('SUCCESS: Connected with empty password!');
        await connection.end();
    } catch (error) {
        console.error('FAILED with empty password:', error.message);
    }
}

testConnection();
