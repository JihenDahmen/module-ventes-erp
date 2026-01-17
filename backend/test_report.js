const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const reportController = require('./controllers/reportController');

async function testEndpoint(name, fn) {
    try {
        console.log(`Testing ${name}...`);
        const req = {};
        const res = {
            json: (data) => {
                console.log(`✅ ${name} result:`);
                console.dir(data, { depth: null });
            },
            status: (code) => ({
                json: (data) => {
                    console.log(`❌ ${name} failed with code ${code}:`);
                    console.dir(data, { depth: null });
                }
            })
        };
        await fn(req, res);
    } catch (e) {
        console.log(`❌ ${name} crashed:`, e.message);
        console.log(e.stack);
    }
}

async function runAll() {
    console.log('--- STARTING REPORTING TESTS ---');
    await testEndpoint('totalRevenue', reportController.getTotalRevenue);
    await testEndpoint('salesByProduct', reportController.getSalesByProduct);
    await testEndpoint('salesByClient', reportController.getSalesByClient);
    await testEndpoint('salesByRegion', reportController.getSalesByRegion);
    await testEndpoint('conversionRate', reportController.getConversionRate);
    await testEndpoint('pendingPayments', reportController.getPendingPayments);
    await testEndpoint('margins', reportController.getMargins);
    await testEndpoint('returns', reportController.getReturns);
    console.log('--- TESTS FINISHED ---');
    process.exit(0);
}

runAll();
