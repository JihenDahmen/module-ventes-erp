const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
    console.log('--- STARTING DATABASE SETUP ---');
    try {
        // 1. Connect without database selected to create it
        console.log('1. Connecting to MySQL (root, no password)...');
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
        });

        // 2. Create Database
        console.log('2. Creating database erp_ventes...');
        await connection.query('CREATE DATABASE IF NOT EXISTS erp_ventes');
        await connection.end();

        // 3. Connect to the new database
        console.log('3. Connecting to erp_ventes...');
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'erp_ventes',
            multipleStatements: true
        });

        // 4. Run Seed Data
        console.log('4. Seeding data...');

        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('DROP TABLE IF EXISTS deliveries');
        await db.query('DROP TABLE IF EXISTS commandes');
        await db.query('DROP TABLE IF EXISTS devis');
        await db.query('DROP TABLE IF EXISTS ventes');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        // Create Tables
        await db.query(`
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

        await db.query(`
            CREATE TABLE IF NOT EXISTS clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255),
                email VARCHAR(255),
                solde DECIMAL(10,2) DEFAULT 0
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS devis (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date_devis DATE,
                montant_estime DECIMAL(10,2),
                client_id INT,
                statut VARCHAR(20)
            )
        `);

        await db.query(`
             CREATE TABLE IF NOT EXISTS commandes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                devis_id INT,
                date_commande DATE,
                montant_final DECIMAL(10,2),
                statut VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS deliveries (
               id INT AUTO_INCREMENT PRIMARY KEY,
               order_id INT NOT NULL,
               client_id INT NOT NULL,
               status VARCHAR(50) DEFAULT 'prepared',
               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           )
       `);

        await db.query(`
           CREATE TABLE IF NOT EXISTS factures (
               id INT AUTO_INCREMENT PRIMARY KEY,
               numero VARCHAR(50),
               client_id INT,
               montant_ttc DECIMAL(10,2),
               statut VARCHAR(20),
               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           )
       `);

        await db.query(`
           CREATE TABLE IF NOT EXISTS paiements (
               id INT AUTO_INCREMENT PRIMARY KEY,
               facture_id INT,
               montant DECIMAL(10,2),
               mode_paiement VARCHAR(50),
               statut VARCHAR(20),
               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               reference VARCHAR(50)
           )
       `);

        await db.query(`
           CREATE TABLE IF NOT EXISTS retours (
               id INT AUTO_INCREMENT PRIMARY KEY,
               statut VARCHAR(20),
               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           )
       `);

        await db.query(`
           CREATE TABLE IF NOT EXISTS produits (
               id INT AUTO_INCREMENT PRIMARY KEY,
               nom VARCHAR(255),
               stock INT,
               prix_ht DECIMAL(10,2)
           )
       `);

        // Insert Data
        console.log('   - Inserting sample data...');

        await db.query("INSERT INTO clients (nom, email, solde) VALUES ('Client A', 'a@test.com', 0), ('Client B', 'b@test.com', 0)");
        await db.query("INSERT INTO produits (nom, stock, prix_ht) VALUES ('Produit X', 100, 50.00), ('Produit Y', 50, 150.00)");

        await db.query("INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES ('2023-01-10', 1000.00, 600.00, 1, 1, 'Nord', 'payé')");

        console.log('✅ DATABASE SETUP COMPLETED SUCCESSFULLY');
        await db.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ SETUP FAILED:', error);
        process.exit(1);
    }
}

setup();
