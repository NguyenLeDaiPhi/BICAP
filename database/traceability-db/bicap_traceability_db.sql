-- BICAP Traceability Database Schema
-- Database: bicap_traceability_db
-- Service: Traceability Service
-- MySQL 8.0
-- ------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ------------------------------------------------------
-- Table: trace_codes
-- Description: Main traceability codes for exported products
-- ------------------------------------------------------
DROP TABLE IF EXISTS `trace_codes`;
CREATE TABLE `trace_codes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trace_code` varchar(50) NOT NULL COMMENT 'Unique traceability code, e.g., BICAP-TRC-2026-000001',
  `trace_type` enum('PRODUCT','BATCH','EXPORT') NOT NULL DEFAULT 'PRODUCT',
  `farm_id` bigint NOT NULL COMMENT 'Reference to farm in Farm Service',
  `farm_name` varchar(255) NOT NULL COMMENT 'Denormalized for query performance',
  `production_batch_id` bigint DEFAULT NULL COMMENT 'Reference to production batch',
  `export_batch_id` bigint DEFAULT NULL COMMENT 'Reference to export batch',
  `product_name` varchar(255) NOT NULL COMMENT 'Denormalized product name',
  `status` enum('ACTIVE','EXPIRED','RECALLED') NOT NULL DEFAULT 'ACTIVE',
  `qr_code_url` varchar(512) DEFAULT NULL COMMENT 'URL to QR code image',
  `blockchain_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verification_count` int NOT NULL DEFAULT 0 COMMENT 'Number of times verified',
  `last_verified_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_trace_code` (`trace_code`),
  INDEX `idx_trace_codes_farm` (`farm_id`),
  INDEX `idx_trace_codes_product` (`product_name`),
  INDEX `idx_trace_codes_status` (`status`),
  INDEX `idx_trace_codes_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: trace_journeys
-- Description: Complete journey/stages of a traced product
-- ------------------------------------------------------
DROP TABLE IF EXISTS `trace_journeys`;
CREATE TABLE `trace_journeys` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trace_code_id` bigint NOT NULL,
  `stage_order` int NOT NULL COMMENT 'Order of stage in journey',
  `stage_name` varchar(100) NOT NULL COMMENT 'e.g., PRODUCTION, HARVEST, PROCESSING, PACKAGING, SHIPPING, DELIVERY',
  `stage_name_vi` varchar(255) NOT NULL COMMENT 'Vietnamese stage name',
  `stage_description` text DEFAULT NULL,
  `farm_id` bigint DEFAULT NULL COMMENT 'Farm where this stage occurred',
  `production_batch_id` bigint DEFAULT NULL,
  `farming_process_id` bigint DEFAULT NULL COMMENT 'Reference to farming process',
  `shipment_id` bigint DEFAULT NULL COMMENT 'Reference to shipment if applicable',
  `started_at` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `blockchain_tx_hash` varchar(255) DEFAULT NULL,
  `blockchain_verified` tinyint(1) NOT NULL DEFAULT 0,
  `evidence_urls` json DEFAULT NULL COMMENT 'Array of evidence image URLs',
  `notes` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_trace_journeys_trace_code` (`trace_code_id`),
  INDEX `idx_trace_journeys_farm` (`farm_id`),
  INDEX `idx_trace_journeys_shipment` (`shipment_id`),
  INDEX `idx_trace_journeys_started` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: trace_verifications
-- Description: Verification records for trace codes
-- ------------------------------------------------------
DROP TABLE IF EXISTS `trace_verifications`;
CREATE TABLE `trace_verifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trace_code_id` bigint NOT NULL,
  `verifier_type` enum('CONSUMER','RETAILER','ADMIN','SYSTEM') NOT NULL,
  `verifier_id` bigint DEFAULT NULL COMMENT 'User ID if logged in',
  `verifier_ip` varchar(45) DEFAULT NULL,
  `verification_method` enum('QR_SCAN','SEARCH','API') NOT NULL DEFAULT 'QR_SCAN',
  `blockchain_valid` tinyint(1) NOT NULL DEFAULT 0,
  `data_integrity_valid` tinyint(1) NOT NULL DEFAULT 0,
  `verification_result` enum('VERIFIED','WARNING','INVALID') NOT NULL,
  `warning_message` text DEFAULT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_trace_verifications_trace_code` (`trace_code_id`),
  INDEX `idx_trace_verifications_verifier` (`verifier_id`),
  INDEX `idx_trace_verifications_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: trace_certificates
-- Description: Certificates associated with traced products
-- ------------------------------------------------------
DROP TABLE IF EXISTS `trace_certificates`;
CREATE TABLE `trace_certificates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trace_code_id` bigint NOT NULL,
  `certificate_type` enum('ORGANIC','GAP','VietGAP','GlobalGAP','IFOAM','USDA','OTHER') NOT NULL,
  `certificate_name` varchar(255) NOT NULL,
  `certificate_number` varchar(100) NOT NULL,
  `issuing_authority` varchar(255) NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `certificate_url` varchar(512) DEFAULT NULL,
  `blockchain_recorded` tinyint(1) NOT NULL DEFAULT 0,
  `blockchain_tx_hash` varchar(255) DEFAULT NULL,
  `is_valid` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_trace_certificates_trace_code` (`trace_code_id`),
  INDEX `idx_trace_certificates_type` (`certificate_type`),
  INDEX `idx_trace_certificates_expiry` (`expiry_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: trace_environmental_data
-- Description: Summary of environmental IoT data for traceability
-- ------------------------------------------------------
DROP TABLE IF EXISTS `trace_environmental_data`;
CREATE TABLE `trace_environmental_data` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trace_code_id` bigint NOT NULL,
  `production_batch_id` bigint DEFAULT NULL,
  `metric_type` enum('TEMPERATURE','HUMIDITY','PH','LIGHT','SOIL_MOISTURE','CO2','RAINFALL','WIND_SPEED') NOT NULL,
  `min_value` decimal(10,4) DEFAULT NULL,
  `max_value` decimal(10,4) DEFAULT NULL,
  `avg_value` decimal(10,4) DEFAULT NULL,
  `unit` varchar(20) NOT NULL,
  `reading_count` int NOT NULL DEFAULT 0,
  `recorded_period_start` datetime(6) NOT NULL,
  `recorded_period_end` datetime(6) NOT NULL,
  `is_within_threshold` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_trace_env_data_trace_code` (`trace_code_id`),
  INDEX `idx_trace_env_data_batch` (`production_batch_id`),
  INDEX `idx_trace_env_data_metric` (`metric_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: trace_shipment_info
-- Description: Shipping information linked to traceability
-- ------------------------------------------------------
DROP TABLE IF EXISTS `trace_shipment_info`;
CREATE TABLE `trace_shipment_info` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trace_code_id` bigint NOT NULL,
  `shipment_id` bigint NOT NULL COMMENT 'Reference to shipment in Shipping Service',
  `shipment_code` varchar(50) NOT NULL,
  `driver_id` bigint DEFAULT NULL,
  `driver_name` varchar(255) DEFAULT NULL,
  `vehicle_plate` varchar(50) DEFAULT NULL,
  `pickup_time` datetime(6) DEFAULT NULL,
  `pickup_location` varchar(255) DEFAULT NULL,
  `pickup_latitude` decimal(10,8) DEFAULT NULL,
  `pickup_longitude` decimal(11,8) DEFAULT NULL,
  `delivery_time` datetime(6) DEFAULT NULL,
  `delivery_location` varchar(255) DEFAULT NULL,
  `delivery_latitude` decimal(10,8) DEFAULT NULL,
  `delivery_longitude` decimal(11,8) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `transport_evidence_urls` json DEFAULT NULL,
  `blockchain_recorded` tinyint(1) NOT NULL DEFAULT 0,
  `blockchain_tx_hash` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_shipment_id` (`shipment_id`),
  INDEX `idx_trace_shipment_trace_code` (`trace_code_id`),
  INDEX `idx_trace_shipment_driver` (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: trace_farm_info
-- Description: Denormalized farm information for traceability display
-- ------------------------------------------------------
DROP TABLE IF EXISTS `trace_farm_info`;
CREATE TABLE `trace_farm_info` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trace_code_id` bigint NOT NULL,
  `farm_id` bigint NOT NULL,
  `farm_name` varchar(255) NOT NULL,
  `farm_address` text NOT NULL,
  `farm_description` text DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `owner_phone` varchar(50) DEFAULT NULL,
  `owner_email` varchar(255) DEFAULT NULL,
  `farm_area` decimal(10,2) DEFAULT NULL,
  `farm_area_unit` varchar(20) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `certifications` json DEFAULT NULL,
  `farm_image_urls` json DEFAULT NULL,
  `blockchain_verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_trace_farm_trace_code` (`trace_code_id`),
  INDEX `idx_trace_farm_farm` (`farm_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: trace_product_info
-- Description: Denormalized product information for traceability display
-- ------------------------------------------------------
DROP TABLE IF EXISTS `trace_product_info`;
CREATE TABLE `trace_product_info` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trace_code_id` bigint NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_category` varchar(100) DEFAULT NULL,
  `product_description` text DEFAULT NULL,
  `product_image_urls` json DEFAULT NULL,
  `harvest_date` date DEFAULT NULL,
  `harvest_quantity` decimal(10,2) DEFAULT NULL,
  `harvest_unit` varchar(50) DEFAULT NULL,
  `export_date` date DEFAULT NULL,
  `export_quantity` decimal(10,2) DEFAULT NULL,
  `export_unit` varchar(50) DEFAULT NULL,
  `batch_code` varchar(100) DEFAULT NULL,
  `production_method` varchar(100) DEFAULT NULL COMMENT 'e.g., Organic, Conventional',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_trace_product_trace_code` (`trace_code_id`),
  INDEX `idx_trace_product_category` (`product_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: trace_blockchain_records
-- Description: Blockchain verification records for traceability
-- ------------------------------------------------------
DROP TABLE IF EXISTS `trace_blockchain_records`;
CREATE TABLE `trace_blockchain_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trace_code_id` bigint NOT NULL,
  `entity_type` enum('TRACE','JOURNEY','CERTIFICATE','SHIPMENT','ENVIRONMENT') NOT NULL,
  `entity_id` bigint NOT NULL,
  `network` varchar(50) NOT NULL DEFAULT 'VeChainThor',
  `transaction_hash` varchar(255) NOT NULL,
  `block_number` bigint DEFAULT NULL,
  `data_hash` varchar(255) NOT NULL COMMENT 'Hash of data recorded on blockchain',
  `recorded_at` datetime(6) NOT NULL,
  `confirmation_status` enum('PENDING','CONFIRMED','FAILED') NOT NULL DEFAULT 'PENDING',
  `confirmed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_blockchain_tx` (`transaction_hash`),
  INDEX `idx_blockchain_records_trace_code` (`trace_code_id`),
  INDEX `idx_blockchain_records_entity` (`entity_type`, `entity_id`),
  INDEX `idx_blockchain_records_status` (`confirmation_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: trace_public_pages
-- Description: Public traceability page content (cached for fast access)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `trace_public_pages`;
CREATE TABLE `trace_public_pages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trace_code_id` bigint NOT NULL,
  `page_content` json NOT NULL COMMENT 'Pre-rendered page content',
  `language` varchar(10) NOT NULL DEFAULT 'vi',
  `version` int NOT NULL DEFAULT 1,
  `last_cached_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_trace_page_cache` (`trace_code_id`, `language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: trace_code_sequences
-- Description: Sequence generator for trace codes
-- ------------------------------------------------------
DROP TABLE IF EXISTS `trace_code_sequences`;
CREATE TABLE `trace_code_sequences` (
  `year` int NOT NULL,
  `last_sequence` bigint NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Insert initial sequence for current year
-- ------------------------------------------------------
LOCK TABLES `trace_code_sequences` WRITE;
INSERT INTO `trace_code_sequences` (`year`, `last_sequence`) VALUES (2026, 0);
UNLOCK TABLES;

-- ------------------------------------------------------
-- Restore settings
-- ------------------------------------------------------
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
