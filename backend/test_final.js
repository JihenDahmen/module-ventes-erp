const Facture = require('./models/Facture');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function test() {
    try {
        console.log('Testing Facture.findAll()...');
        const factures = await Facture.findAll();
        console.log(`Found ${factures.length} factures.`);
        factures.forEach(f => console.log(`- ${f.numero}: ${f.montant_ttc} DT (${f.statut})`));

        console.log('--- DB LINK VERIFIED ---');
        process.exit(0);
    } catch (e) {
        console.error('Test failed:', e);
        process.exit(1);
    }
}

test();
