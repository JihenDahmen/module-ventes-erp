const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const db = require('./backend/config/db');
const reportController = require('./backend/controllers/reportController');

async function testEndpoint(name, fn) {
    try {
        console.log(`Testing ${name}...`);
        const req = {};
        const res = {
            json: (data) => console.log(`✅ ${name} result:`, data),
            status: (code) => ({
                json: (data) => console.log(`❌ ${name} failed with code ${code}:`, data)
            })
        };
        await fn(req, res);
    } catch (e) {
        console.log(`❌ ${name} crashed:`, e.message);
    }
}

async function runAll() {
    await testEndpoint('totalRevenue', reportController.getTotalRevenue);
    await testEndpoint('salesByProduct', reportController.getSalesByProduct);
    await testEndpoint('salesByClient', reportController.getSalesByClient);
    await testEndpoint('salesByRegion', reportController.getSalesByRegion);
    await testEndpoint('conversionRate', reportController.getConversionRate);
    await testEndpoint('pendingPayments', reportController.getPendingPayments);
    await testEndpoint('margins', reportController.getMargins);
    await testEndpoint('returns', reportController.getReturns);
    process.exit(0);
}

runAll();
