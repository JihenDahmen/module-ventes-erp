const db = require('./src/config/db');

async function seed() {
    try {
        console.log('--- Cleaning old data ---');
        await db.query('DROP TABLE IF EXISTS sales_items'); // Clean up if exists
        await db.query('DROP TABLE IF EXISTS devis');
        await db.query('DROP TABLE IF EXISTS commandes');
        // Drop table ventes to recreate with new column if needed, or just delete data. 
        // For simplicity in this dev script, we'll drop and recreate to ensure schema is correct.
        await db.query('DROP TABLE IF EXISTS ventes');

        console.log('--- Creating Tables ---');

        // 1. Table Ventes (Updated with cout_achat)
        await db.query(`CREATE TABLE IF NOT EXISTS ventes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date_vente DATE,
      montant DECIMAL(10,2),
      cout_achat DECIMAL(10,2),
      produit_id INT,
      client_id INT,
      region VARCHAR(50),
      statut VARCHAR(20)
    )`);

        // 2. Table Devis
        await db.query(`CREATE TABLE IF NOT EXISTS devis (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date_devis DATE,
      montant_estime DECIMAL(10,2),
      client_id INT,
      statut VARCHAR(20) -- 'signé', 'en_attente', 'rejeté'
    )`);

        // 3. Table Commandes
        await db.query(`CREATE TABLE IF NOT EXISTS commandes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      devis_id INT,
      date_commande DATE,
      montant_final DECIMAL(10,2),
      statut VARCHAR(20)
    )`);

        console.log('--- Inserting sample data ---');

        // Ventes (avec cout_achat et statuts variés)
        const ventesQueries = [
            "INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES ('2023-01-10', 1000.00, 600.00, 101, 1, 'Nord', 'payé')",
            "INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES ('2023-01-12', 1500.50, 900.00, 102, 2, 'Sud', 'payé')",
            "INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES ('2023-01-15', 200.00, 120.00, 101, 1, 'Nord', 'en_attente')",
            "INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES ('2023-02-01', 3000.00, 1800.00, 103, 3, 'Est', 'payé')",
            "INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES ('2023-02-05', 500.00, 300.00, 102, 2, 'Sud', 'en_attente')",
            "INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES ('2023-03-10', 750.00, 400.00, 104, 4, 'Ouest', 'retourné')",
            "INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES ('2023-03-12', 1200.00, 700.00, 101, 5, 'Nord', 'payé')",
            "INSERT INTO ventes (date_vente, montant, cout_achat, produit_id, client_id, region, statut) VALUES ('2023-03-15', 850.00, 450.00, 105, 4, 'Ouest', 'retourné')"
        ];
        for (const q of ventesQueries) await db.query(q);

        // Devis (10 devis au total)
        const devisQueries = [
            "INSERT INTO devis (date_devis, montant_estime, client_id, statut) VALUES ('2023-01-01', 1000.00, 1, 'signé')",
            "INSERT INTO devis (date_devis, montant_estime, client_id, statut) VALUES ('2023-01-02', 1500.00, 2, 'signé')",
            "INSERT INTO devis (date_devis, montant_estime, client_id, statut) VALUES ('2023-01-03', 2000.00, 3, 'en_attente')",
            "INSERT INTO devis (date_devis, montant_estime, client_id, statut) VALUES ('2023-01-04', 3000.00, 4, 'signé')",
            "INSERT INTO devis (date_devis, montant_estime, client_id, statut) VALUES ('2023-01-05', 500.00, 5, 'rejeté')",
            "INSERT INTO devis (date_devis, montant_estime, client_id, statut) VALUES ('2023-01-06', 750.00, 1, 'signé')",
            "INSERT INTO devis (date_devis, montant_estime, client_id, statut) VALUES ('2023-01-07', 1200.00, 2, 'en_attente')",
            "INSERT INTO devis (date_devis, montant_estime, client_id, statut) VALUES ('2023-01-08', 800.00, 3, 'rejeté')",
            "INSERT INTO devis (date_devis, montant_estime, client_id, statut) VALUES ('2023-01-09', 1100.00, 4, 'signé')",
            "INSERT INTO devis (date_devis, montant_estime, client_id, statut) VALUES ('2023-01-10', 250.00, 5, 'en_attente')"
        ];
        for (const q of devisQueries) await db.query(q);

        // Commandes (5 commandes issues des devis signés)
        const commandesQueries = [
            "INSERT INTO commandes (devis_id, date_commande, montant_final, statut) VALUES (1, '2023-01-10', 1000.00, 'validée')",
            "INSERT INTO commandes (devis_id, date_commande, montant_final, statut) VALUES (2, '2023-01-12', 1500.00, 'validée')",
            "INSERT INTO commandes (devis_id, date_commande, montant_final, statut) VALUES (4, '2023-02-01', 3000.00, 'validée')",
            "INSERT INTO commandes (devis_id, date_commande, montant_final, statut) VALUES (6, '2023-03-10', 750.00, 'validée')",
            "INSERT INTO commandes (devis_id, date_commande, montant_final, statut) VALUES (9, '2023-03-15', 1100.00, 'en_cours')"
        ];
        for (const q of commandesQueries) await db.query(q);

        console.log('--- Seeding completed successfully with FULL dataset ---');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
