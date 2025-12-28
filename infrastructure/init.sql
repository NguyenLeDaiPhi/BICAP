-- 1. Database cho Farm Production Service (Service 1)
CREATE DATABASE IF NOT EXISTS bicap_farm_production_db;

-- 2. Database cho Blockchain Adapter Service (Service 2)
CREATE DATABASE IF NOT EXISTS bicap_blockchain_db;

-- Cấp quyền đầy đủ cho user root (để chắc chắn)
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;