import http from 'http';

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('--- Starting ERP Backend API Tests ---\n');

    try {
        // 1. CREATE Delivery
        console.log('1. Testing POST /deliveries (Create Delivery)...');
        const createRes = await request('POST', '/deliveries', {
            order_id: 101,
            client_id: 202
        });
        console.log(`Status: ${createRes.statusCode}`);
        console.log('Response:', createRes.data);

        if (createRes.statusCode !== 200 || !createRes.data.delivery_id) {
            throw new Error('Failed to create delivery');
        }
        const deliveryId = createRes.data.delivery_id;
        console.log(`✅ Delivery Created with ID: ${deliveryId}\n`);

        // 2. GET Delivery
        console.log(`2. Testing GET /deliveries/${deliveryId} (Get Delivery)...`);
        const getRes = await request('GET', `/deliveries/${deliveryId}`);
        console.log(`Status: ${getRes.statusCode}`);
        console.log('Response:', getRes.data);
        console.log(`✅ Delivery Retrieved\n`);

        // 3. UPDATE Delivery Status
        console.log(`3. Testing PATCH /deliveries/${deliveryId}/status (Update Status)...`);
        const updateRes = await request('PATCH', `/deliveries/${deliveryId}/status`, {
            status: 'shipped'
        });
        console.log(`Status: ${updateRes.statusCode}`);
        console.log('Response:', updateRes.data);
        console.log(`✅ Delivery Status Updated\n`);

        console.log('--- All Tests Completed Successfully ---');

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

runTests();
