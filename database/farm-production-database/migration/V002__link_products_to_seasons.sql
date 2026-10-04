-- Retain batch_id as the production season; export_batch_id is a separate link.
-- Apply with the farm database selected. Safe to apply more than once.
SET @bicap_migration_sql = IF(EXISTS (
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketplace_products' AND COLUMN_NAME = 'export_batch_id'
), 'SELECT 1', 'ALTER TABLE marketplace_products ADD COLUMN export_batch_id BIGINT NULL AFTER batch_id');
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;

SET @bicap_migration_sql = IF(EXISTS (
  SELECT 1 FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketplace_products'
    AND COLUMN_NAME = 'export_batch_id' AND NON_UNIQUE = 0
), 'SELECT 1', 'ALTER TABLE marketplace_products ADD UNIQUE INDEX uk_marketplace_products_export_batch (export_batch_id)');
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;

SET @bicap_migration_sql = IF(EXISTS (
  SELECT 1 FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketplace_products'
    AND COLUMN_NAME = 'batch_id' AND SEQ_IN_INDEX = 1
), 'SELECT 1', 'ALTER TABLE marketplace_products ADD INDEX idx_marketplace_products_batch (batch_id)');
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;

SET @bicap_migration_sql = IF(EXISTS (
  SELECT 1 FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketplace_products'
    AND COLUMN_NAME = 'batch_id' AND REFERENCED_TABLE_NAME = 'production_batches'
), 'SELECT 1', 'ALTER TABLE marketplace_products ADD CONSTRAINT fk_marketplace_products_batch FOREIGN KEY (batch_id) REFERENCES production_batches (id)');
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;

SET @bicap_migration_sql = IF(EXISTS (
  SELECT 1 FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marketplace_products'
    AND COLUMN_NAME = 'export_batch_id' AND REFERENCED_TABLE_NAME = 'export_batches'
), 'SELECT 1', 'ALTER TABLE marketplace_products ADD CONSTRAINT fk_marketplace_products_export_batch FOREIGN KEY (export_batch_id) REFERENCES export_batches (id)');
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;
