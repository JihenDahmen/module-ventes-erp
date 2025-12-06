import db from './config/db.js';

async function setup() {
    console.log('--- Setting up DB for ERP Backend ---');
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS deliveries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                client_id INT NOT NULL,
                status VARCHAR(50) DEFAULT 'prepared',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await db.promise().query(createTableQuery);
        console.log('✅ Table "deliveries" checked/created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating table:', err);
        process.exit(1);
    }
}

setup();
