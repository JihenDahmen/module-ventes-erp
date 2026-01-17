const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const Facture = require('./backend/models/Facture');

async function test() {
    try {
        console.log('Testing Facture.findAll()...');
        const factures = await Facture.findAll();
        console.log(`Found ${factures.length} factures.`);
        factures.forEach(f => console.log(`- ${f.numero}: ${f.montant_ttc} DT (${f.statut})`));

        const Paiement = require('./backend/models/Paiement');
        const paiements = await Paiement.findAll();
        console.log(`Found ${paiements.length} paiements.`);

        const Retour = require('./backend/models/Retour');
        const retours = await Retour.findAll();
        console.log(`Found ${retours.length} retours.`);

        process.exit(0);
    } catch (e) {
        console.error('Test failed:', e);
        process.exit(1);
    }
}

test();
