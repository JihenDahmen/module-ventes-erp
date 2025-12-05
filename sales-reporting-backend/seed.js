const db = require('./src/config/db');

async function seed() {
    try {
        console.log('--- Cleaning old data ---');
        await db.query('DELETE FROM ventes');

        console.log('--- Inserting sample data ---');
        const queries = [
            "INSERT INTO ventes (date_vente, montant, produit_id, client_id, region, statut) VALUES ('2023-01-10', 1000.00, 101, 1, 'Nord', 'payé')",
            "INSERT INTO ventes (date_vente, montant, produit_id, client_id, region, statut) VALUES ('2023-01-12', 1500.50, 102, 2, 'Sud', 'payé')",
            "INSERT INTO ventes (date_vente, montant, produit_id, client_id, region, statut) VALUES ('2023-01-15', 200.00, 101, 1, 'Nord', 'en_attente')",
            "INSERT INTO ventes (date_vente, montant, produit_id, client_id, region, statut) VALUES ('2023-02-01', 3000.00, 103, 3, 'Est', 'payé')",
            "INSERT INTO ventes (date_vente, montant, produit_id, client_id, region, statut) VALUES ('2023-02-05', 500.00, 102, 2, 'Sud', 'en_attente')",
            "INSERT INTO ventes (date_vente, montant, produit_id, client_id, region, statut) VALUES ('2023-03-10', 750.00, 104, 4, 'Ouest', 'annulé')",
            "INSERT INTO ventes (date_vente, montant, produit_id, client_id, region, statut) VALUES ('2023-03-12', 1200.00, 101, 5, 'Nord', 'payé')"
        ];

        for (const q of queries) {
            await db.query(q);
        }

        console.log('--- Seeding completed successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
