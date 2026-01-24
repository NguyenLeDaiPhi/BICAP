/**
 * Test script để kiểm tra server và các routes
 * Chạy: node test-server.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3002';
const tests = [];

// Helper function để test route
function testRoute(name, path, method = 'GET', data = null) {
    return new Promise((resolve) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                const result = {
                    name,
                    path,
                    status: res.statusCode,
                    success: res.statusCode < 400,
                    message: res.statusCode < 400 ? 'OK' : `Error ${res.statusCode}`
                };
                tests.push(result);
                console.log(`${result.success ? '✓' : '✗'} ${name}: ${result.message} (${res.statusCode})`);
                resolve(result);
            });
        });

        req.on('error', (error) => {
            const result = {
                name,
                path,
                status: 0,
                success: false,
                message: error.message
            };
            tests.push(result);
            console.log(`✗ ${name}: ${error.message}`);
            resolve(result);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Chạy tests
async function runTests() {
    console.log('🧪 Testing Farm Management Web Server...\n');
    console.log('Testing routes (some may require authentication):\n');

    // Test public routes
    await testRoute('Homepage', '/');
    await testRoute('Login Page', '/login');
    await testRoute('Register Page', '/register');

    // Test protected routes (sẽ trả về redirect hoặc 401)
    await testRoute('Dashboard', '/dashboard');
    await testRoute('Season Monitor', '/season-monitor');
    await testRoute('Farm Info', '/farm-info');
    await testRoute('Products', '/products');
    await testRoute('Notifications', '/notifications');

    // Test API routes (sẽ trả về 401 nếu chưa login)
    await testRoute('Get Season Detail API', '/api/season-monitor/1/detail');
    await testRoute('Get Notifications API', '/api/notifications');

    // Summary
    console.log('\n📊 Test Summary:');
    console.log('='.repeat(50));
    const passed = tests.filter(t => t.success).length;
    const failed = tests.filter(t => !t.success).length;
    console.log(`Total: ${tests.length}`);
    console.log(`✓ Passed: ${passed}`);
    console.log(`✗ Failed: ${failed}`);

    if (failed > 0) {
        console.log('\n⚠️  Note: Some routes may require authentication.');
        console.log('   Failed routes are expected if you haven\'t logged in.');
    }

    console.log('\n✅ Server is running and responding to requests!');
    console.log('   To test authenticated routes, login first at: http://localhost:3002/login');
}

// Check if server is running
const checkServer = http.get(BASE_URL, (res) => {
    runTests();
}).on('error', (err) => {
    console.error('❌ Server is not running!');
    console.error('   Please start the server first: npm start');
    console.error(`   Error: ${err.message}`);
    process.exit(1);
});

checkServer.setTimeout(5000, () => {
    checkServer.destroy();
    console.error('❌ Server connection timeout!');
    console.error('   Please check if server is running on port 3002');
    process.exit(1);
});
