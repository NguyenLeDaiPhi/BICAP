-- Metadata used by ImageStorageService. Existing product_images data is preserved.
CREATE TABLE IF NOT EXISTS image_metadata (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  bucket_name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NULL,
  reference_id VARCHAR(255) NULL,
  uploaded_by VARCHAR(255) NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NULL,
  is_active BIT(1) NOT NULL DEFAULT b'1',
  UNIQUE KEY uk_image_metadata_filename (stored_filename),
  KEY idx_image_metadata_reference (reference_id),
  KEY idx_image_metadata_category (category),
  KEY idx_image_metadata_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
