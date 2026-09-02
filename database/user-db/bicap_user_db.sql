-- BICAP User Database Schema
-- Database: bicap_user_db
-- Service: User Service
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
-- Table: user_profiles
-- Description: Extended user profile information
-- ------------------------------------------------------
DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT 'Reference to user in Auth Service',
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `full_name` varchar(255) GENERATED ALWAYS AS (CONCAT(COALESCE(`first_name`, ''), ' ', COALESCE(`last_name`, ''))) STORED,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY') DEFAULT NULL,
  `avatar_url` varchar(512) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `ward` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `social_links` json DEFAULT NULL COMMENT 'Social media links',
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified_at` datetime(6) DEFAULT NULL,
  `verification_documents` json DEFAULT NULL COMMENT 'Document IDs for verification',
  `preferred_language` varchar(10) DEFAULT 'vi',
  `preferred_currency` varchar(3) DEFAULT 'VND',
  `timezone` varchar(50) DEFAULT 'Asia/Ho_Chi_Minh',
  `notification_preferences` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_user_profile_user_id` (`user_id`),
  INDEX `idx_user_profiles_phone` (`phone`),
  INDEX `idx_user_profiles_verified` (`is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: user_addresses
-- Description: User saved addresses (for shipping)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `user_addresses`;
CREATE TABLE `user_addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `address_type` enum('HOME','WORK','OTHER') NOT NULL DEFAULT 'HOME',
  `address_label` varchar(100) DEFAULT NULL COMMENT 'e.g., Nhà riêng, Văn phòng',
  `full_address` text NOT NULL,
  `province` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `ward` varchar(100) NOT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `recipient_name` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_user_addresses_user` (`user_id`),
  INDEX `idx_user_addresses_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: user_activities
-- Description: User activity logs for analytics
-- ------------------------------------------------------
DROP TABLE IF EXISTS `user_activities`;
CREATE TABLE `user_activities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `activity_type` varchar(100) NOT NULL COMMENT 'e.g., LOGIN, VIEW_PRODUCT, CREATE_ORDER',
  `activity_data` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL COMMENT 'e.g., WEB, MOBILE, TABLET',
  `os` varchar(100) DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `duration_ms` bigint DEFAULT NULL COMMENT 'Activity duration in milliseconds',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_user_activities_user` (`user_id`),
  INDEX `idx_user_activities_type` (`activity_type`),
  INDEX `idx_user_activities_created` (`created_at`),
  INDEX `idx_user_activities_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: user_sessions
-- Description: User login sessions
-- ------------------------------------------------------
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `device_info` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `login_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_activity_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `expires_at` datetime(6) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `logout_at` datetime(6) DEFAULT NULL,
  `logout_reason` varchar(100) DEFAULT NULL COMMENT 'e.g., USER_LOGOUT, SESSION_EXPIRED, FORCE_LOGOUT',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_session_token` (`session_token`),
  INDEX `idx_user_sessions_user` (`user_id`),
  INDEX `idx_user_sessions_active` (`is_active`),
  INDEX `idx_user_sessions_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: user_devices
-- Description: User registered devices for push notifications
-- ------------------------------------------------------
DROP TABLE IF EXISTS `user_devices`;
CREATE TABLE `user_devices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `device_token` varchar(512) NOT NULL COMMENT 'Push notification token',
  `device_type` enum('IOS','ANDROID','WEB','TABLET') NOT NULL,
  `device_name` varchar(255) DEFAULT NULL COMMENT 'e.g., iPhone 14, Chrome on Windows',
  `device_model` varchar(100) DEFAULT NULL,
  `os_version` varchar(50) DEFAULT NULL,
  `app_version` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `last_active_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_device_token` (`device_token`),
  INDEX `idx_user_devices_user` (`user_id`),
  INDEX `idx_user_devices_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: user_kyc
-- Description: User KYC (Know Your Customer) information
-- ------------------------------------------------------
DROP TABLE IF EXISTS `user_kyc`;
CREATE TABLE `user_kyc` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `kyc_type` enum('BASIC','STANDARD','ENHANCED') NOT NULL DEFAULT 'BASIC',
  `id_card_number` varchar(50) DEFAULT NULL,
  `id_card_front_url` varchar(512) DEFAULT NULL,
  `id_card_back_url` varchar(512) DEFAULT NULL,
  `id_card_issue_date` date DEFAULT NULL,
  `id_card_expiry_date` date DEFAULT NULL,
  `id_card_issue_place` varchar(255) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `business_license_url` varchar(512) DEFAULT NULL,
  `kyc_status` enum('NOT_STARTED','PENDING','VERIFIED','REJECTED','EXPIRED') NOT NULL DEFAULT 'NOT_STARTED',
  `verification_notes` text DEFAULT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `verified_at` datetime(6) DEFAULT NULL,
  `verified_by` bigint DEFAULT NULL,
  `rejected_at` datetime(6) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_user_kyc_user` (`user_id`),
  INDEX `idx_user_kyc_status` (`kyc_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: user_privacy_settings
-- Description: User privacy and data settings
-- ------------------------------------------------------
DROP TABLE IF EXISTS `user_privacy_settings`;
CREATE TABLE `user_privacy_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `profile_visibility` enum('PUBLIC','FRIENDS','PRIVATE') NOT NULL DEFAULT 'PRIVATE',
  `show_email` tinyint(1) NOT NULL DEFAULT 0,
  `show_phone` tinyint(1) NOT NULL DEFAULT 0,
  `show_location` tinyint(1) NOT NULL DEFAULT 0,
  `allow_search_by_email` tinyint(1) NOT NULL DEFAULT 0,
  `allow_search_by_phone` tinyint(1) NOT NULL DEFAULT 0,
  `allow_marketing_emails` tinyint(1) NOT NULL DEFAULT 1,
  `allow_sms_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `allow_push_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `data_processing_consent` tinyint(1) NOT NULL DEFAULT 0,
  `data_processing_consent_at` datetime(6) DEFAULT NULL,
  `marketing_consent` tinyint(1) NOT NULL DEFAULT 0,
  `marketing_consent_at` datetime(6) DEFAULT NULL,
  `third_party_sharing_consent` tinyint(1) NOT NULL DEFAULT 0,
  `third_party_consent_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_user_privacy_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: user_relationships
-- Description: User relationships (for farms, retailers, etc.)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `user_relationships`;
CREATE TABLE `user_relationships` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `related_user_id` bigint DEFAULT NULL COMMENT 'For user-to-user relationships',
  `related_entity_type` enum('USER','FARM','RETAILER','SHIPPING_COMPANY') DEFAULT NULL,
  `related_entity_id` bigint DEFAULT NULL,
  `relationship_type` varchar(100) NOT NULL COMMENT 'e.g., FARM_OWNER, EMPLOYEE, PARTNER',
  `relationship_status` enum('PENDING','ACTIVE','INACTIVE','REJECTED') NOT NULL DEFAULT 'PENDING',
  `invited_at` datetime(6) DEFAULT NULL,
  `accepted_at` datetime(6) DEFAULT NULL,
  `rejected_at` datetime(6) DEFAULT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `permissions` json DEFAULT NULL COMMENT 'Granular permissions for this relationship',
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_user_relationships_user` (`user_id`),
  INDEX `idx_user_relationships_related` (`related_user_id`),
  INDEX `idx_user_relationships_entity` (`related_entity_type`, `related_entity_id`),
  INDEX `idx_user_relationships_status` (`relationship_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
