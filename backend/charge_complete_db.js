const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
    console.log('--- STARTING COMPREHENSIVE DATABASE SETUP ---');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        const dbName = 'erp_ventes';
        console.log(`1. Creating database ${dbName}...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        await connection.end();

        console.log(`2. Connecting to ${dbName}...`);
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: dbName,
            multipleStatements: true
        });

        console.log('3. Dropping existing tables...');
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        const tables = [
            'lignes_retour', 'retours', 'avoirs', 'paiements',
            'lignes_facture', 'factures', 'deliveries', 'commandes',
            'devis', 'ventes', 'produits', 'clients'
        ];
        for (const table of tables) {
            await db.query(`DROP TABLE IF EXISTS ${table}`);
        }
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('4. Creating tables...');

        // Clients
        await db.query(`
            CREATE TABLE clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                telephone VARCHAR(50),
                adresse TEXT,
                solde DECIMAL(10,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Produits
        await db.query(`
            CREATE TABLE produits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                reference VARCHAR(100) UNIQUE,
                stock INT DEFAULT 0,
                prix_ht DECIMAL(10,2) NOT NULL,
                tva DECIMAL(5,2) DEFAULT 20.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Quotes (Devis)
        await db.query(`
            CREATE TABLE quotes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date_devis DATE,
                total DECIMAL(10,2),
                taxes DECIMAL(10,2),
                client_id INT,
                status VARCHAR(20) DEFAULT 'en_attente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES clients(id)
            )
        `);

        // Quote Items
        await db.query(`
            CREATE TABLE quote_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                quote_id INT,
                product_id INT,
                quantity INT,
                unit_price DECIMAL(10,2),
                FOREIGN KEY (quote_id) REFERENCES quotes(id),
                FOREIGN KEY (product_id) REFERENCES produits(id)
            )
        `);

        // Orders (Commandes)
        await db.query(`
            CREATE TABLE orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                quote_id INT,
                date_commande DATE,
                total DECIMAL(10,2),
                status VARCHAR(20) DEFAULT 'en_cours',
                client_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (quote_id) REFERENCES quotes(id),
                FOREIGN KEY (client_id) REFERENCES clients(id)
            )
        `);

        // Order Items
        await db.query(`
            CREATE TABLE order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                product_id INT,
                quantity INT,
                unit_price DECIMAL(10,2),
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES produits(id)
            )
        `);

        // Deliveries
        await db.query(`
            CREATE TABLE deliveries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                client_id INT NOT NULL,
                status VARCHAR(50) DEFAULT 'prepared',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (client_id) REFERENCES clients(id)
            )
        `);

        // Factures
        await db.query(`
            CREATE TABLE factures (
                id INT AUTO_INCREMENT PRIMARY KEY,
                numero VARCHAR(50) UNIQUE,
                client_id INT,
                date_facture DATE,
                montant_ht DECIMAL(10,2),
                montant_tva DECIMAL(10,2),
                montant_ttc DECIMAL(10,2),
                statut VARCHAR(20) DEFAULT 'brouillon',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES clients(id)
            )
        `);

        // Lignes Facture
        await db.query(`
            CREATE TABLE lignes_facture (
                id INT AUTO_INCREMENT PRIMARY KEY,
                facture_id INT,
                produit_id INT,
                quantite INT,
                prix_unitaire DECIMAL(10,2),
                remise DECIMAL(5,2) DEFAULT 0,
                sous_total DECIMAL(10,2),
                FOREIGN KEY (facture_id) REFERENCES factures(id),
                FOREIGN KEY (produit_id) REFERENCES produits(id)
            )
        `);

        // Paiements
        await db.query(`
            CREATE TABLE paiements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reference VARCHAR(50) UNIQUE,
                facture_id INT,
                montant DECIMAL(10,2),
                mode_paiement VARCHAR(50),
                date_paiement DATE,
                notes TEXT,
                statut VARCHAR(20) DEFAULT 'reçu',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (facture_id) REFERENCES factures(id)
            )
        `);

        // Retours
        await db.query(`
            CREATE TABLE retours (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reference VARCHAR(50) UNIQUE,
                facture_id INT,
                client_id INT,
                date_retour DATE,
                motif VARCHAR(255),
                notes TEXT,
                statut VARCHAR(20) DEFAULT 'demandé',
                date_validation DATETIME,
                valide_par VARCHAR(100),
                date_reception DATETIME,
                receptionne_par VARCHAR(100),
                date_cloture DATETIME,
                cloture_par VARCHAR(100),
                raison_rejet TEXT,
                rejete_par VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (facture_id) REFERENCES factures(id),
                FOREIGN KEY (client_id) REFERENCES clients(id)
            )
        `);

        // Lignes Retour
        await db.query(`
            CREATE TABLE lignes_retour (
                id INT AUTO_INCREMENT PRIMARY KEY,
                retour_id INT,
                produit_id INT,
                ligne_facture_id INT,
                quantite_retournee INT,
                raison TEXT,
                FOREIGN KEY (retour_id) REFERENCES retours(id),
                FOREIGN KEY (produit_id) REFERENCES produits(id),
                FOREIGN KEY (ligne_facture_id) REFERENCES lignes_facture(id)
            )
        `);

        // Avoirs
        await db.query(`
            CREATE TABLE avoirs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                numero VARCHAR(50) UNIQUE,
                retour_id INT,
                client_id INT,
                montant DECIMAL(10,2),
                type VARCHAR(50),
                date_avoir DATE,
                statut VARCHAR(20),
                FOREIGN KEY (retour_id) REFERENCES retours(id),
                FOREIGN KEY (client_id) REFERENCES clients(id)
            )
        `);

        // Ventes (Reporting)
        await db.query(`
            CREATE TABLE ventes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date_vente DATE,
                montant DECIMAL(10,2),
                cout_achat DECIMAL(10,2),
                produit_id INT,
                client_id INT,
                region VARCHAR(50),
                statut VARCHAR(20),
                FOREIGN KEY (produit_id) REFERENCES produits(id),
                FOREIGN KEY (client_id) REFERENCES clients(id)
            )
        `);

        console.log('5. Seeding data...');

        // Sample Clients
        await db.query(`
            INSERT INTO clients (nom, email, telephone, adresse, solde) VALUES 
            ('Tech Solutions', 'contact@techsol.com', '0123456789', '123 Tech Park', 1500.00),
            ('Global Logistics', 'info@gl-logistics.com', '0987654321', '456 Hub St', 0.00),
            ('Retail Corp', 'sales@retailcorp.fr', '0147253698', '789 Market Ave', 250.50)
        `);

        // Sample Produits
        await db.query(`
            INSERT INTO produits (nom, reference, stock, prix_ht, tva) VALUES 
            ('Laptop Pro 15', 'LP-15-2024', 25, 1200.00, 20.00),
            ('Wireless Mouse', 'WM-01', 150, 45.00, 20.00),
            ('4K Monitor 27', 'MON-27-4K', 15, 350.00, 20.00),
            ('USB-C Dock', 'DOCK-UC', 40, 89.00, 20.00)
        `);

        // Sample Quotes
        await db.query(`
            INSERT INTO quotes (date_devis, total, taxes, client_id, status) VALUES 
            ('2024-01-05', 1250.00, 250.00, 1, 'validé'),
            ('2024-01-07', 350.00, 70.00, 2, 'validé'),
            ('2024-01-10', 2500.00, 500.00, 3, 'en_attente')
        `);

        // Sample Quote Items
        await db.query(`
            INSERT INTO quote_items (quote_id, product_id, quantity, unit_price) VALUES 
            (1, 1, 1, 1200.00),
            (1, 2, 1, 50.00),
            (2, 3, 1, 350.00)
        `);

        // Sample Orders
        await db.query(`
            INSERT INTO orders (quote_id, date_commande, total, status, client_id) VALUES 
            (1, '2024-01-06', 1500.00, 'validée', 1),
            (2, '2024-01-08', 420.00, 'validée', 2)
        `);

        // Sample Order Items
        await db.query(`
            INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES 
            (1, 1, 1, 1200.00),
            (1, 2, 1, 50.00),
            (2, 3, 1, 350.00)
        `);

        // Sample Deliveries
        await db.query(`
            INSERT INTO deliveries (order_id, client_id, status) VALUES 
            (1, 1, 'delivered'),
            (2, 2, 'shipped')
        `);

        // Sample Factures
        await db.query(`
            INSERT INTO factures (numero, client_id, date_facture, montant_ht, montant_tva, montant_ttc, statut) VALUES 
            ('FACT-2024-0001', 1, '2024-01-06', 1250.00, 250.00, 1500.00, 'payée'),
            ('FACT-2024-0002', 2, '2024-01-08', 416.67, 83.33, 500.00, 'validée'),
            ('FACT-2024-0003', 1, '2024-01-11', 1000.00, 200.00, 1200.00, 'brouillon')
        `);

        // Sample Lignes Facture
        await db.query(`
            INSERT INTO lignes_facture (facture_id, produit_id, quantite, prix_unitaire, sous_total) VALUES 
            (1, 1, 1, 1200.00, 1200.00),
            (1, 2, 1, 50.00, 50.00),
            (2, 3, 1, 350.00, 350.00),
            (2, 4, 1, 66.67, 66.67)
        `);

        // Sample Paiements
        await db.query(`
            INSERT INTO paiements (reference, facture_id, montant, mode_paiement, date_paiement, statut) VALUES 
            ('PAY-2024-001', 1, 1500.00, 'Virement', '2024-01-10', 'reçu')
        `);

        // Sample Retours
        await db.query(`
            INSERT INTO retours (reference, facture_id, client_id, date_retour, motif, statut) VALUES 
            ('RET-2024-0001', 1, 1, '2024-01-12', 'Defective mouse', 'demandé')
        `);

        // Sample Ventes (Reporting)
        await db.query(`
            INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES 
            ('2024-01-06', 1500.00, 900.00, 1, 1, 'Nord', 'payé'),
            ('2024-01-08', 500.00, 300.00, 3, 2, 'Sud', 'payé'),
            ('2024-01-11', 1200.00, 700.00, 1, 1, 'Nord', 'en_attente')
        `);

        console.log('✅ DATABASE SETUP AND SEEDING COMPLETED SUCCESSFULLY!');
        await db.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ SETUP FAILED:', error);
        process.exit(1);
    }
}

setup();
