-- Apply to the farm database selected by the MySQL client.
-- Existing databases: add the ExportBatch.farm mapping without resetting data.
-- Safe to run again, including after loading the updated initialization schema.
SET @bicap_migration_sql = IF(
    EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'export_batches'
          AND COLUMN_NAME = 'farm_id'
    ),
    'SELECT 1',
    'ALTER TABLE export_batches ADD COLUMN farm_id BIGINT NULL AFTER batch_id'
);
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;

-- Derive the farm of historical exports from their production batch.
UPDATE export_batches e
JOIN production_batches b ON b.id = e.batch_id
SET e.farm_id = b.farm_id
WHERE e.farm_id IS NULL;

SET @bicap_migration_sql = IF(
    EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'export_batches'
          AND COLUMN_NAME = 'farm_id' AND SEQ_IN_INDEX = 1
    ),
    'SELECT 1',
    'ALTER TABLE export_batches ADD INDEX idx_export_batches_farm_id (farm_id)'
);
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;

SET @bicap_migration_sql = IF(
    EXISTS (
        SELECT 1 FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'export_batches'
          AND COLUMN_NAME = 'farm_id' AND REFERENCED_TABLE_NAME = 'farms'
          AND REFERENCED_COLUMN_NAME = 'id'
    ),
    'SELECT 1',
    'ALTER TABLE export_batches ADD CONSTRAINT fk_export_batches_farm FOREIGN KEY (farm_id) REFERENCES farms (id)'
);
PREPARE bicap_migration FROM @bicap_migration_sql;
EXECUTE bicap_migration;
DEALLOCATE PREPARE bicap_migration;
