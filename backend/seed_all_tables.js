const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
    console.log('--- STARTING DATA SEEDING FOR ALL TABLES ---');
    try {
        const dbName = 'erp_ventes';
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: dbName,
            multipleStatements: true
        });

        console.log('1. Disabling foreign key checks...');
        await db.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('2. Inserting sample data...');

        // Clients
        console.log('   - Clients...');
        await db.query(`
            INSERT INTO clients (nom, email, telephone, adresse, solde) VALUES 
            ('Alice Wonderland', 'alice@example.com', '0101010101', '123 Rabbit Hole', 500.00),
            ('Bob Builder', 'bob@example.com', '0202020202', '456 Construction Way', 1200.00),
            ('Charlie Chocolate', 'charlie@example.com', '0303030303', '789 Factory St', 0.00),
            ('Diana Prince', 'diana@example.com', '0404040404', '101 Amazon Island', 2500.00),
            ('Eve Online', 'eve@example.com', '0505050505', '202 Virtual Space', 75.50)
        `);

        // Produits
        console.log('   - Produits...');
        await db.query(`
            INSERT INTO produits (nom, reference, stock, prix_ht, tva) VALUES 
            ('Smartphone X', 'PH-001', 50, 600.00, 20.00),
            ('Tablet Pro', 'TB-002', 30, 450.00, 20.00),
            ('Laptop Air', 'LT-003', 20, 1000.00, 20.00),
            ('Smartwatch Gen 5', 'SW-004', 100, 150.00, 20.00),
            ('Bluetooth Speaker', 'SP-005', 75, 80.00, 20.00)
        `);

        // Quotes (Devis)
        console.log('   - Quotes...');
        await db.query(`
            INSERT INTO quotes (date_devis, total, taxes, client_id, status) VALUES 
            ('2024-02-01', 720.00, 144.00, 1, 'validé'),
            ('2024-02-02', 1200.00, 240.00, 2, 'validé'),
            ('2024-02-03', 150.00, 30.00, 3, 'en_attente'),
            ('2024-02-04', 3000.00, 600.00, 4, 'annulé'),
            ('2024-02-05', 1080.00, 216.00, 5, 'validé')
        `);

        // Quote Items
        console.log('   - Quote Items...');
        await db.query(`
            INSERT INTO quote_items (quote_id, product_id, quantity, unit_price) VALUES 
            (1, 1, 1, 600.00), (1, 5, 1, 80.00),
            (2, 3, 1, 1000.00), (2, 4, 1, 150.00),
            (3, 4, 1, 150.00),
            (5, 1, 1, 600.00), (5, 2, 1, 400.00)
        `);

        // Orders (Commandes)
        console.log('   - Orders...');
        await db.query(`
            INSERT INTO orders (quote_id, date_commande, total, status, client_id) VALUES 
            (1, '2024-02-02', 864.00, 'validée', 1),
            (2, '2024-02-03', 1440.00, 'validée', 2),
            (5, '2024-02-06', 1296.00, 'validée', 5)
        `);

        // Order Items
        console.log('   - Order Items...');
        await db.query(`
            INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES 
            (1, 1, 1, 600.00), (1, 5, 1, 80.00),
            (2, 3, 1, 1000.00), (2, 4, 1, 150.00),
            (3, 1, 1, 600.00), (3, 2, 1, 400.00)
        `);

        // Deliveries
        console.log('   - Deliveries...');
        await db.query(`
            INSERT INTO deliveries (order_id, client_id, status) VALUES 
            (1, 1, 'delivered'),
            (2, 2, 'shipped'),
            (3, 5, 'prepared')
        `);

        // Factures
        console.log('   - Factures...');
        await db.query(`
            INSERT INTO factures (numero, client_id, date_facture, montant_ht, montant_tva, montant_ttc, statut) VALUES 
            ('FACT-2024-101', 1, '2024-02-02', 680.00, 136.00, 816.00, 'payée'),
            ('FACT-2024-102', 2, '2024-02-03', 1150.00, 230.00, 1380.00, 'validée'),
            ('FACT-2024-103', 5, '2024-02-06', 1000.00, 200.00, 1200.00, 'brouillon')
        `);

        // Lignes Facture
        console.log('   - Lignes Facture...');
        await db.query(`
            INSERT INTO lignes_facture (facture_id, produit_id, quantite, prix_unitaire, sous_total) VALUES 
            (1, 1, 1, 600.00, 600.00),
            (1, 5, 1, 80.00, 80.00),
            (2, 3, 1, 1000.00, 1000.00),
            (2, 4, 1, 150.00, 150.00)
        `);

        // Paiements
        console.log('   - Paiements...');
        await db.query(`
            INSERT INTO paiements (reference, facture_id, montant, mode_paiement, date_paiement, statut) VALUES 
            ('PAY-B-001', 1, 816.00, 'Carte Bancaire', '2024-02-05', 'reçu'),
            ('PAY-B-002', 2, 500.00, 'Virement', '2024-02-07', 'reçu')
        `);

        // Retours
        console.log('   - Retours...');
        await db.query(`
            INSERT INTO retours (reference, facture_id, client_id, date_retour, motif, statut) VALUES 
            ('RET-X-001', 1, 1, '2024-02-10', 'Changement d avis', 'validé'),
            ('RET-X-002', 2, 2, '2024-02-12', 'Produit défectueux', 'demandé')
        `);

        // Lignes Retour
        console.log('   - Lignes Retour...');
        await db.query(`
            INSERT INTO lignes_retour (retour_id, produit_id, ligne_facture_id, quantite_retournee, raison) VALUES 
            (1, 5, 2, 1, 'Ne convient pas')
        `);

        // Avoirs
        console.log('   - Avoirs...');
        await db.query(`
            INSERT INTO avoirs (numero, retour_id, client_id, montant, type, date_avoir, statut) VALUES 
            ('AV-2024-01', 1, 1, 96.00, 'Remboursement', '2024-02-15', 'émis')
        `);

        // Ventes (Reporting)
        console.log('   - Ventes...');
        await db.query(`
            INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES 
            ('2024-02-02', 816.00, 500.00, 1, 1, 'Nord', 'payé'),
            ('2024-02-03', 1380.00, 800.00, 3, 2, 'Sud', 'payé'),
            ('2024-02-06', 1200.00, 750.00, 1, 5, 'Est', 'en_attente')
        `);

        console.log('3. Enabling foreign key checks...');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ DATA SEEDING COMPLETED SUCCESSFULLY');
        await db.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ SEEDING FAILED:', error);
        process.exit(1);
    }
}

seed();
