-- Image Storage Database
CREATE DATABASE IF NOT EXISTS image_storage_db;
USE image_storage_db;

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL COMMENT 'Product ID from farm-production-service',
    farm_id BIGINT NOT NULL COMMENT 'Farm ID',
    file_name VARCHAR(255) NOT NULL COMMENT 'Generated file name',
    original_name VARCHAR(255) COMMENT 'Original file name',
    content_type VARCHAR(100) COMMENT 'MIME type (e.g., image/jpeg)',
    file_size BIGINT COMMENT 'File size in bytes',
    storage_path VARCHAR(500) NOT NULL COMMENT 'Path in storage (S3/MinIO)',
    storage_url VARCHAR(1000) COMMENT 'Public URL or presigned URL',
    status VARCHAR(50) DEFAULT 'ACTIVE' COMMENT 'ACTIVE, DELETED',
    uploaded_by BIGINT COMMENT 'User ID who uploaded',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_farm_id (farm_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
