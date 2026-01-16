const http = require('http');

console.log('--- Starting ERP Yasmine API Tests ---');

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4000,
            path: '/api' + path,
            method: method,
            headers: { 'Content-Type': 'application/json' },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    try {
        // 1. Create Quote
        console.log('\n1. Creating Quote...');
        const createRes = await request('POST', '/quotes', {
            client_id: 1,
            items: [
                { product_id: 101, quantity: 2, unit_price: 50 },
                { product_id: 102, quantity: 1, unit_price: 100 }
            ]
        });
        console.log(`Status: ${createRes.statusCode}`, createRes.data);
        const quoteId = createRes.data.id;
        if (!quoteId) throw new Error('Quote creation failed');

        // 2. Validate Quote
        console.log(`\n2. Validating Quote (ID: ${quoteId})...`);
        const updateRes = await request('PUT', `/quotes/${quoteId}/status`, { status: 'validé' });
        console.log(`Status: ${updateRes.statusCode}`, updateRes.data);

        // 3. Convert to Order
        console.log(`\n3. Converting Quote to Order...`);
        const convertRes = await request('POST', `/quotes/${quoteId}/convert-to-order`);
        console.log(`Status: ${convertRes.statusCode}`, convertRes.data);
        const orderId = convertRes.data.order_id;
        if (!orderId) throw new Error('Order conversion failed');

        // 4. Get Order
        console.log(`\n4. Getting Order (ID: ${orderId})...`);
        const getOrderRes = await request('GET', `/orders/${orderId}`);
        console.log(`Status: ${getOrderRes.statusCode}`, getOrderRes.data);

        console.log('\n✅ All tests passed successfully!');

    } catch (e) {
        console.error('❌ Test Failed:', e);
    }
}

runTests();
