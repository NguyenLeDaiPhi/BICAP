-- BICAP Payment Database Schema
-- Database: bicap_payment_db
-- Service: Payment Service
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
-- Table: payments
-- Description: Main payment transactions
-- ------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `payment_code` varchar(50) NOT NULL COMMENT 'Unique payment reference code',
  `order_id` bigint NOT NULL COMMENT 'Reference to order in Order Service',
  `payment_type` enum('DEPOSIT','FULL','INSTALLMENT','REFUND') NOT NULL DEFAULT 'FULL',
  `amount` decimal(14,2) NOT NULL COMMENT 'Payment amount',
  `currency` varchar(3) NOT NULL DEFAULT 'VND',
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `payment_method` enum('BANK_TRANSFER','CREDIT_CARD','E_WALLET','CASH','VNPAY','MOMO') DEFAULT NULL,
  `payment_provider` varchar(100) DEFAULT NULL COMMENT 'e.g., VNPay, MoMo, ZaloPay',
  `provider_transaction_id` varchar(255) DEFAULT NULL COMMENT 'Transaction ID from payment provider',
  `bank_code` varchar(50) DEFAULT NULL,
  `card_type` varchar(50) DEFAULT NULL,
  `payer_id` bigint NOT NULL COMMENT 'User who made the payment',
  `payee_id` bigint DEFAULT NULL COMMENT 'User who receives the payment',
  `description` varchar(500) DEFAULT NULL,
  `metadata` json DEFAULT NULL COMMENT 'Additional payment metadata',
  `initiated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `processed_at` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `failed_at` datetime(6) DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_payment_code` (`payment_code`),
  UNIQUE KEY `UK_provider_tx` (`payment_provider`, `provider_transaction_id`),
  INDEX `idx_payments_order` (`order_id`),
  INDEX `idx_payments_payer` (`payer_id`),
  INDEX `idx_payments_payee` (`payee_id`),
  INDEX `idx_payments_status` (`status`),
  INDEX `idx_payments_method` (`payment_method`),
  INDEX `idx_payments_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: payment_transactions
-- Description: Detailed transaction logs for payments
-- ------------------------------------------------------
DROP TABLE IF EXISTS `payment_transactions`;
CREATE TABLE `payment_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `payment_id` bigint NOT NULL,
  `transaction_type` enum('INITIATION','VERIFICATION','AUTHORIZATION','CAPTURE','REFUND','REVERSAL','NOTIFICATION') NOT NULL,
  `status` enum('SUCCESS','FAILED','PENDING','TIMEOUT') NOT NULL,
  `request_data` json DEFAULT NULL COMMENT 'Request sent to provider',
  `response_data` json DEFAULT NULL COMMENT 'Response from provider',
  `error_code` varchar(50) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_payment_transactions_payment` (`payment_id`),
  INDEX `idx_payment_transactions_status` (`status`),
  INDEX `idx_payment_transactions_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: payment_refunds
-- Description: Refund records
-- ------------------------------------------------------
DROP TABLE IF EXISTS `payment_refunds`;
CREATE TABLE `payment_refunds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `refund_code` varchar(50) NOT NULL,
  `payment_id` bigint NOT NULL,
  `original_payment_id` bigint DEFAULT NULL COMMENT 'If this is a refund of a refund',
  `amount` decimal(14,2) NOT NULL COMMENT 'Amount to refund',
  `reason` varchar(500) NOT NULL,
  `refund_type` enum('FULL','PARTIAL') NOT NULL DEFAULT 'FULL',
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `requested_by` bigint NOT NULL COMMENT 'User who requested refund',
  `processed_by` bigint DEFAULT NULL COMMENT 'Admin who processed refund',
  `provider_refund_id` varchar(255) DEFAULT NULL,
  `requested_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `processed_at` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `failed_at` datetime(6) DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_refund_code` (`refund_code`),
  INDEX `idx_payment_refunds_payment` (`payment_id`),
  INDEX `idx_payment_refunds_status` (`status`),
  INDEX `idx_payment_refunds_requested` (`requested_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: payment_methods
-- Description: Saved payment methods for users
-- ------------------------------------------------------
DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE `payment_methods` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `method_type` enum('BANK_ACCOUNT','CREDIT_CARD','DEBIT_CARD','E_WALLET') NOT NULL,
  `provider` varchar(100) NOT NULL COMMENT 'e.g., VNPay, MoMo, ZaloPay, Bank Name',
  `account_holder` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL COMMENT 'Masked account number',
  `bank_code` varchar(50) DEFAULT NULL,
  `card_brand` varchar(50) DEFAULT NULL COMMENT 'e.g., Visa, Mastercard',
  `card_last_four` varchar(4) DEFAULT NULL,
  `expiry_month` int DEFAULT NULL,
  `expiry_year` int DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `provider_token` varchar(500) DEFAULT NULL COMMENT 'Token from provider for recurring payments',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_payment_methods_user` (`user_id`),
  INDEX `idx_payment_methods_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: payment_webhooks
-- Description: Webhook events from payment providers
-- ------------------------------------------------------
DROP TABLE IF EXISTS `payment_webhooks`;
CREATE TABLE `payment_webhooks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `provider` varchar(100) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_data` json NOT NULL,
  `signature` varchar(500) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_processed` tinyint(1) NOT NULL DEFAULT 0,
  `processed_at` datetime(6) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `retry_count` int NOT NULL DEFAULT 0,
  `ip_address` varchar(45) DEFAULT NULL,
  `received_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_payment_webhooks_provider` (`provider`),
  INDEX `idx_payment_webhooks_event` (`event_type`),
  INDEX `idx_payment_webhooks_processed` (`is_processed`),
  INDEX `idx_payment_webhooks_received` (`received_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: payment_reconciliation
-- Description: Daily reconciliation records
-- ------------------------------------------------------
DROP TABLE IF EXISTS `payment_reconciliation`;
CREATE TABLE `payment_reconciliation` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reconciliation_date` date NOT NULL,
  `provider` varchar(100) NOT NULL,
  `total_transactions` int NOT NULL DEFAULT 0,
  `total_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `successful_transactions` int NOT NULL DEFAULT 0,
  `successful_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `failed_transactions` int NOT NULL DEFAULT 0,
  `failed_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `refunded_transactions` int NOT NULL DEFAULT 0,
  `refunded_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `provider_total` decimal(14,2) DEFAULT NULL COMMENT 'Total from provider statement',
  `variance` decimal(14,2) DEFAULT NULL COMMENT 'Difference between system and provider',
  `status` enum('PENDING','RECONCILED','DISPUTED','RESOLVED') NOT NULL DEFAULT 'PENDING',
  `notes` text DEFAULT NULL,
  `reconciled_by` bigint DEFAULT NULL,
  `reconciled_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_reconciliation_date_provider` (`reconciliation_date`, `provider`),
  INDEX `idx_reconciliation_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: service_packages
-- Description: Service packages for farms (subscription)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `service_packages`;
CREATE TABLE `service_packages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `package_code` varchar(50) NOT NULL,
  `package_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `duration_days` int NOT NULL COMMENT 'Duration in days',
  `price` decimal(14,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'VND',
  `features` json DEFAULT NULL COMMENT 'List of features included',
  `max_farms` int NOT NULL DEFAULT 1 COMMENT 'Maximum farms allowed',
  `max_products` int NOT NULL DEFAULT 100 COMMENT 'Maximum products allowed',
  `max_storage_mb` bigint NOT NULL DEFAULT 100 COMMENT 'Storage limit in MB',
  `includes_blockchain` tinyint(1) NOT NULL DEFAULT 0,
  `includes_iot` tinyint(1) NOT NULL DEFAULT 0,
  `includes_priority_support` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_package_code` (`package_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: package_subscriptions
-- Description: Farm subscriptions to service packages
-- ------------------------------------------------------
DROP TABLE IF EXISTS `package_subscriptions`;
CREATE TABLE `package_subscriptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `subscription_code` varchar(50) NOT NULL,
  `farm_id` bigint NOT NULL COMMENT 'Reference to farm in Farm Service',
  `package_id` bigint NOT NULL,
  `payment_id` bigint DEFAULT NULL COMMENT 'Payment for this subscription',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('ACTIVE','EXPIRED','CANCELLED','SUSPENDED','PENDING_PAYMENT') NOT NULL DEFAULT 'PENDING_PAYMENT',
  `auto_renew` tinyint(1) NOT NULL DEFAULT 1,
  `cancelled_at` datetime(6) DEFAULT NULL,
  `cancellation_reason` varchar(500) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_subscription_code` (`subscription_code`),
  INDEX `idx_package_subscriptions_farm` (`farm_id`),
  INDEX `idx_package_subscriptions_package` (`package_id`),
  INDEX `idx_package_subscriptions_status` (`status`),
  INDEX `idx_package_subscriptions_end_date` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Insert default service packages
-- ------------------------------------------------------
LOCK TABLES `service_packages` WRITE;
INSERT INTO `service_packages` (`package_code`, `package_name`, `description`, `duration_days`, `price`, `features`, `max_farms`, `max_products`, `includes_blockchain`, `includes_iot`, `is_featured`, `sort_order`) VALUES
('PACKAGE_BASIC', 'Gói Cơ Bản', 'Gói dịch vụ cơ bản cho trang trại nhỏ', 30, 299000.00, '["Quản lý trang trại", "Quản lý mùa vụ", "Tối đa 50 sản phẩm", "1GB lưu trữ"]', 1, 50, 0, 0, 0, 1),
('PACKAGE_STANDARD', 'Gói Tiêu Chuẩn', 'Gói dịch vụ tiêu chuẩn với Blockchain', 30, 599000.00, '["Tất cả tính năng gói Cơ Bản", "Ghi dữ liệu lên Blockchain", "Tối đa 200 sản phẩm", "5GB lưu trữ", "Báo cáo cơ bản"]', 2, 200, 1, 0, 1, 2),
('PACKAGE_PREMIUM', 'Gói Premium', 'Gói đầy đủ tính năng với IoT', 30, 999000.00, '["Tất cả tính năng gói Tiêu Chuẩn", "Kết nối thiết bị IoT", "Tối đa 500 sản phẩm", "20GB lưu trữ", "Báo cáo nâng cao", "Hỗ trợ ưu tiên"]', 5, 500, 1, 1, 1, 3),
('PACKAGE_ENTERPRISE', 'Gói Doanh Nghiệp', 'Gói cho doanh nghiệp lớn', 365, 8999000.00, '["Không giới hạn trang trại", "Không giới hạn sản phẩm", "Không giới hạn lưu trữ", "API truy cập", "Hỗ trợ 24/7", "Custom integration"]', 999, 999999, 1, 1, 0, 4);
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
