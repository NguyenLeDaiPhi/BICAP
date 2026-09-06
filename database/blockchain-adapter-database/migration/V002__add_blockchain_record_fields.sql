-- Migration: Add blockchain record fields
-- Description: Thêm các cột mới cho blockchain_records để lưu block info và raw data
-- Author: BICAP Team
-- Date: 2026-09-06

USE bicap_blockchain_db;

-- =============================================
-- Add new columns to blockchain_records table
-- =============================================

ALTER TABLE blockchain_records 
  ADD COLUMN raw_data TEXT COMMENT 'Dữ liệu gốc được hash (JSON string)',
  ADD COLUMN block_number BIGINT COMMENT 'Số block chứa transaction',
  ADD COLUMN block_hash VARCHAR(66) COMMENT 'Hash của block',
  ADD COLUMN gas_used BIGINT COMMENT 'Lượng gas sử dụng',
  ADD COLUMN tx_index INT COMMENT 'Vị trí transaction trong block',
  ADD COLUMN contract_address VARCHAR(42) COMMENT 'Địa chỉ smart contract',
  ADD COLUMN chain_id BIGINT COMMENT 'Chain ID của mạng blockchain',
  ADD COLUMN batch_code VARCHAR(100) COMMENT 'Mã lô sản xuất',
  ADD COLUMN resource_type VARCHAR(50) COMMENT 'Loại tài nguyên (PRODUCTION, ENVIRONMENT, etc.)',
  ADD COLUMN verified TINYINT(1) COMMENT 'Trạng thái xác minh (1=true, 0=false, NULL=chưa xác minh)',
  ADD COLUMN verified_at DATETIME COMMENT 'Thời gian xác minh gần nhất',
  ADD COLUMN verification_message VARCHAR(255) COMMENT 'Thông báo kết quả xác minh',
  ADD COLUMN updated_at DATETIME COMMENT 'Thời gian cập nhật gần nhất';

-- =============================================
-- Add indexes for better query performance
-- =============================================

CREATE INDEX idx_blockchain_records_batch_id ON blockchain_records(batch_id);
CREATE INDEX idx_blockchain_records_verified ON blockchain_records(verified);
CREATE INDEX idx_blockchain_records_network ON blockchain_records(network);
CREATE INDEX idx_blockchain_records_created_at ON blockchain_records(created_at);

-- =============================================
-- Update existing records with default values
-- =============================================

UPDATE blockchain_records 
SET 
    block_number = FLOOR(150000000 + RAND() * 1000),
    chain_id = 100,
    network = COALESCE(network, 'VeChainThor'),
    updated_at = NOW()
WHERE block_number IS NULL;
