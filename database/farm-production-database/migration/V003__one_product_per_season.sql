-- Apply to farm_production_db. Existing duplicate seasons must be resolved before applying.
-- Backfill older export-linked products without discarding any records.
UPDATE marketplace_products p JOIN export_batches e ON e.id = p.export_batch_id SET p.batch_id = e.batch_id WHERE p.batch_id IS NULL;

SET @bicap_migration_sql = IF(EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketplace_products' AND COLUMN_NAME = 'batch_id' AND NON_UNIQUE = 0), 'SELECT 1', 'ALTER TABLE marketplace_products ADD UNIQUE INDEX uk_marketplace_products_season (batch_id)');
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;

