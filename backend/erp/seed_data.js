import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'erp_sales_db',
    multipleStatements: true
};

async function seed() {
    let connection;
    try {
        console.log('--- Connecting to database ---');
        connection = await mysql.createConnection(dbConfig);

        console.log('--- Dropping existing tables ---');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DROP TABLE IF EXISTS deliveries');
        await connection.query('DROP TABLE IF EXISTS commandes');
        await connection.query('DROP TABLE IF EXISTS devis');
        await connection.query('DROP TABLE IF EXISTS ventes');
        await connection.query('DROP TABLE IF EXISTS sales_items');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('--- Creating schema ---');

        // 1. Table Ventes
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ventes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date_vente DATE,
                montant DECIMAL(10,2),
                cout_achat DECIMAL(10,2),
                produit_id INT,
                client_id INT,
                region VARCHAR(50),
                statut VARCHAR(20)
            )
        `);

        // 2. Table Devis
        await connection.query(`
            CREATE TABLE IF NOT EXISTS devis (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date_devis DATE,
                montant_estime DECIMAL(10,2),
                client_id INT,
                statut VARCHAR(20)
            )
        `);

        // 3. Table Commandes
        await connection.query(`
            CREATE TABLE IF NOT EXISTS commandes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                devis_id INT,
                date_commande DATE,
                montant_final DECIMAL(10,2),
                statut VARCHAR(20)
            )
        `);

        // 4. Table Deliveries
        await connection.query(`
             CREATE TABLE IF NOT EXISTS deliveries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                client_id INT NOT NULL,
                status VARCHAR(50) DEFAULT 'prepared',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('--- Inserting sample data ---');

        // Ventes
        const ventesValues = [
            ['2023-01-10', 1000.00, 600.00, 101, 1, 'Nord', 'payé'],
            ['2023-01-12', 1500.50, 900.00, 102, 2, 'Sud', 'payé'],
            ['2023-01-15', 200.00, 120.00, 101, 1, 'Nord', 'en_attente'],
            ['2023-02-01', 3000.00, 1800.00, 103, 3, 'Est', 'payé'],
            ['2023-02-05', 500.00, 300.00, 102, 2, 'Sud', 'en_attente'],
            ['2023-03-10', 750.00, 400.00, 104, 4, 'Ouest', 'retourné'],
            ['2023-03-12', 1200.00, 700.00, 101, 5, 'Nord', 'payé'],
            ['2023-03-15', 850.00, 450.00, 105, 4, 'Ouest', 'retourné']
        ];
        await connection.query('INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES ?', [ventesValues]);

        // Devis
        const devisValues = [
            ['2023-01-01', 1000.00, 1, 'signé'],
            ['2023-01-02', 1500.00, 2, 'signé'],
            ['2023-01-03', 2000.00, 3, 'en_attente'],
            ['2023-01-04', 3000.00, 4, 'signé'],
            ['2023-01-05', 500.00, 5, 'rejeté'],
            ['2023-01-06', 750.00, 1, 'signé'],
            ['2023-01-07', 1200.00, 2, 'en_attente'],
            ['2023-01-08', 800.00, 3, 'rejeté'],
            ['2023-01-09', 1100.00, 4, 'signé'],
            ['2023-01-10', 250.00, 5, 'en_attente']
        ];
        await connection.query('INSERT INTO devis (date_devis, montant_estime, client_id, statut) VALUES ?', [devisValues]);

        // Commandes (linked to signed devis)
        // IDs: 1 (Client 1), 2 (Client 2), 4 (Client 4), 6 (Client 1), 9 (Client 4)
        const commandesValues = [
            [1, '2023-01-10', 1000.00, 'validée'],
            [2, '2023-01-12', 1500.00, 'validée'],
            [4, '2023-02-01', 3000.00, 'validée'],
            [6, '2023-03-10', 750.00, 'validée'],
            [9, '2023-03-15', 1100.00, 'en_cours']
        ];
        await connection.query('INSERT INTO commandes (devis_id, date_commande, montant_final, statut) VALUES ?', [commandesValues]);

        // Deliveries (linked to commandes)
        // Commande IDs will be 1, 2, 3, 4, 5 auto-incremented
        const deliveriesValues = [
            [1, 1, 'livré'],    // Order 1, Client 1
            [2, 2, 'en_cours'], // Order 2, Client 2
            [3, 4, 'préparé'],  // Order 3, Client 4
            [4, 1, 'livré']     // Order 4, Client 1
        ];
        await connection.query('INSERT INTO deliveries (order_id, client_id, status) VALUES ?', [deliveriesValues]);

        console.log('✅ Seeding completed successfully!');

    } catch (err) {
        console.error('❌ Error during seeding:', err);
    } finally {
        if (connection) await connection.end();
    }
}

seed();
