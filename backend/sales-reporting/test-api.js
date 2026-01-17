const http = require('http');

const endpoints = [
    '/api/report/total-revenue',
    '/api/report/sales-by-product',
    '/api/report/sales-by-client',
    '/api/report/sales-by-region',
    '/api/report/conversion-rate',
    '/api/report/pending-payments',
    '/api/report/margins',
    '/api/report/returns'
];

console.log('--- Démarrage des tests API ---\n');

endpoints.forEach(endpoint => {
    http.get(`http://localhost:5000${endpoint}`, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`GET ${endpoint} : Status ${res.statusCode}`);
            if (res.statusCode === 200) {
                try {
                    const parsed = JSON.parse(data);
                    console.log('Response:', JSON.stringify(parsed, null, 2).substring(0, 100) + '...');
                } catch (e) {
                    console.log('Response (raw):', data);
                }
            } else {
                console.error('Error:', data);
            }
            console.log('-----------------------------');
        });

    }).on('error', (err) => {
        console.error(`Error requesting ${endpoint}:`, err);
    });
});
