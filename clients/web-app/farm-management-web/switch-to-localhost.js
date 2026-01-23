#!/usr/bin/env node

/**
 * Script để chuyển đổi .env từ Docker (kong-gateway) sang Local (localhost)
 * Usage: node switch-to-localhost.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'config', '.env');
const backupPath = path.join(__dirname, 'config', '.env.docker.backup');

try {
    // Đọc file .env hiện tại
    if (!fs.existsSync(envPath)) {
        console.error('❌ File .env không tồn tại!');
        process.exit(1);
    }

    let envContent = fs.readFileSync(envPath, 'utf8');

    // Backup file gốc
    fs.writeFileSync(backupPath, envContent);
    console.log('✅ Đã backup file .env thành .env.docker.backup');

    // Thay thế kong-gateway thành localhost
    const replacements = [
        { from: /kong-gateway/g, to: 'localhost' },
        { from: /bicap-message-queue/g, to: 'localhost' }
    ];

    let modified = false;
    replacements.forEach(({ from, to }) => {
        if (envContent.match(from)) {
            envContent = envContent.replace(from, to);
            modified = true;
            console.log(`✅ Đã thay thế '${from.source}' thành '${to}'`);
        }
    });

    if (modified) {
        // Ghi lại file
        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ Đã cập nhật file .env để dùng localhost');
        console.log('📝 File backup: config/.env.docker.backup');
        console.log('\n⚠️  Lưu ý: Cần restart Node.js server để áp dụng thay đổi!');
    } else {
        console.log('ℹ️  Không có thay đổi nào (có thể đã dùng localhost rồi)');
    }

} catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
}
