-- Apply to the trading database; safe to re-run.
SET @bicap_migration_sql = IF(EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketplace_products' AND COLUMN_NAME = 'source_product_id'), 'SELECT 1', 'ALTER TABLE marketplace_products ADD COLUMN source_product_id BIGINT NULL');
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;

SET @bicap_migration_sql = IF(EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketplace_products' AND COLUMN_NAME = 'production_batch_id'), 'SELECT 1', 'ALTER TABLE marketplace_products ADD COLUMN production_batch_id BIGINT NULL');
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;

SET @bicap_migration_sql = IF(EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketplace_products' AND COLUMN_NAME = 'source_product_id' AND NON_UNIQUE = 0), 'SELECT 1', 'ALTER TABLE marketplace_products ADD UNIQUE INDEX uk_trading_source_product (source_product_id)');
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;

