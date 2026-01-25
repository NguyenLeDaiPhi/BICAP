#!/usr/bin/env node

/**
 * Script kiểm tra Kong Gateway và các services
 */

const http = require('http');

async function checkService(name, url, timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const req = http.get(url, { timeout }, (res) => {
            const duration = Date.now() - startTime;
            resolve({
                name,
                url,
                status: 'OK',
                statusCode: res.statusCode,
                duration: `${duration}ms`
            });
        });

        req.on('error', (error) => {
            const duration = Date.now() - startTime;
            resolve({
                name,
                url,
                status: 'ERROR',
                error: error.message,
                duration: `${duration}ms`
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                name,
                url,
                status: 'TIMEOUT',
                error: `Timeout after ${timeout}ms`
            });
        });
    });
}

async function main() {
    console.log('🔍 Checking services...\n');

    const services = [
        { name: 'Kong Gateway', url: 'http://localhost:8000' },
        { name: 'Kong Admin', url: 'http://localhost:8001' },
        { name: 'Auth Service (via Kong)', url: 'http://localhost:8000/api/auth/login' },
    ];

    const results = [];
    for (const service of services) {
        const result = await checkService(service.name, service.url);
        results.push(result);
        
        if (result.status === 'OK') {
            console.log(`✅ ${result.name}: ${result.statusCode} (${result.duration})`);
        } else {
            console.log(`❌ ${result.name}: ${result.error}`);
        }
    }

    console.log('\n📊 Summary:');
    const okCount = results.filter(r => r.status === 'OK').length;
    const errorCount = results.filter(r => r.status !== 'OK').length;
    
    console.log(`   ✅ Working: ${okCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);

    if (errorCount > 0) {
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Check if Kong Gateway is running:');
        console.log('      docker ps | grep kong');
        console.log('   2. Start Kong Gateway:');
        console.log('      docker-compose up -d kong-gateway');
        console.log('   3. Check Kong Gateway logs:');
        console.log('      docker-compose logs kong-gateway');
        process.exit(1);
    } else {
        console.log('\n✅ All services are reachable!');
        process.exit(0);
    }
}

main().catch(console.error);
