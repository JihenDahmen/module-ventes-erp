require('dotenv').config();
const db = require('./database');

async function setup() {
    console.log('--- Setting up DB for ERP Yasmine (Quotes/Orders) ---');
    try {
        // 1. Table Quotes
        await db.query(`
            CREATE TABLE IF NOT EXISTS quotes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                taxes DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'en_attente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "quotes" checked/created.');

        // 2. Table Quote Items
        await db.query(`
            CREATE TABLE IF NOT EXISTS quote_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                quote_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table "quote_items" checked/created.');

        // 3. Table Orders
        await db.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'en_cours',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "orders" checked/created.');

        // 4. Table Order Items
        await db.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table "order_items" checked/created.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating tables:', err);
        process.exit(1);
    }
}

setup();
