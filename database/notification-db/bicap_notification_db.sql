-- BICAP Notification Database Schema
-- Database: bicap_notification_db
-- Service: Notification Service
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
-- Table: notifications
-- Description: Main notification table for all system notifications
-- ------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `notification_type` enum('SYSTEM','ORDER','PAYMENT','SHIPPING','IOT_ALERT','BLOCKCHAIN','FARM','TRADING') NOT NULL,
  `status` enum('UNREAD','READ','ARCHIVED') NOT NULL DEFAULT 'UNREAD',
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  `user_id` bigint NOT NULL,
  `user_role` varchar(50) DEFAULT NULL,
  `reference_id` bigint DEFAULT NULL COMMENT 'Reference to related entity (order_id, farm_id, etc.)',
  `reference_type` varchar(50) DEFAULT NULL COMMENT 'Type of referenced entity',
  `is_broadcast` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 if broadcast to all users of a role',
  `action_url` varchar(512) DEFAULT NULL COMMENT 'URL to navigate when clicked',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `read_at` datetime(6) DEFAULT NULL,
  `archived_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user_id` (`user_id`),
  INDEX `idx_notifications_user_role` (`user_role`),
  INDEX `idx_notifications_type` (`notification_type`),
  INDEX `idx_notifications_status` (`status`),
  INDEX `idx_notifications_created_at` (`created_at`),
  INDEX `idx_notifications_broadcast` (`is_broadcast`, `user_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: notification_preferences
-- Description: User notification preferences settings
-- ------------------------------------------------------
DROP TABLE IF EXISTS `notification_preferences`;
CREATE TABLE `notification_preferences` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `email_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `push_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sms_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `system_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `order_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `payment_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `shipping_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `iot_alert_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `blockchain_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `farm_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `trading_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `quiet_hours_start` time DEFAULT NULL,
  `quiet_hours_end` time DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_notification_prefs_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: notification_templates
-- Description: Predefined notification templates
-- ------------------------------------------------------
DROP TABLE IF EXISTS `notification_templates`;
CREATE TABLE `notification_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `template_code` varchar(100) NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `notification_type` enum('SYSTEM','ORDER','PAYMENT','SHIPPING','IOT_ALERT','BLOCKCHAIN','FARM','TRADING') NOT NULL,
  `title_template` varchar(255) NOT NULL,
  `message_template` text NOT NULL,
  `default_priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_template_code` (`template_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: notification_logs
-- Description: Log for sent notifications (audit trail)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `notification_logs`;
CREATE TABLE `notification_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `notification_id` bigint NOT NULL,
  `recipient_id` bigint NOT NULL,
  `recipient_role` varchar(50) DEFAULT NULL,
  `channel` enum('IN_APP','EMAIL','PUSH','SMS') NOT NULL,
  `status` enum('PENDING','SENT','DELIVERED','FAILED','BOUNCED') NOT NULL DEFAULT 'PENDING',
  `sent_at` datetime(6) DEFAULT NULL,
  `delivered_at` datetime(6) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `retry_count` int NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_notification_logs_notification` (`notification_id`),
  INDEX `idx_notification_logs_recipient` (`recipient_id`),
  INDEX `idx_notification_logs_status` (`status`),
  INDEX `idx_notification_logs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Insert default notification templates
-- ------------------------------------------------------
LOCK TABLES `notification_templates` WRITE;
INSERT INTO `notification_templates` VALUES 
(1,'ORDER_CREATED','Thông báo tạo đơn hàng mới','ORDER','Đơn hàng mới','Bạn có một yêu cầu đặt hàng mới từ {retailer_name}. Mã đơn: {order_code}','MEDIUM',1),
(2,'ORDER_ACCEPTED','Thông báo chấp nhận đơn hàng','ORDER','Đơn hàng được chấp nhận','Đơn hàng {order_code} đã được chấp nhận. Vui lòng tiến hành thanh toán cọc.','HIGH',1),
(3,'ORDER_REJECTED','Thông báo từ chối đơn hàng','ORDER','Đơn hàng bị từ chối','Đơn hàng {order_code} đã bị từ chối. Lý do: {reason}','MEDIUM',1),
(4,'PAYMENT_DEPOSIT_RECEIVED','Thông báo nhận cọc','PAYMENT','Đã nhận thanh toán cọc','Đã nhận thanh toán cọc {amount} cho đơn hàng {order_code}.','HIGH',1),
(5,'PAYMENT_COMPLETED','Thông báo thanh toán hoàn tất','PAYMENT','Thanh toán hoàn tất','Thanh toán cho đơn hàng {order_code} đã hoàn tất.','HIGH',1),
(6,'SHIPMENT_CREATED','Thông báo tạo vận chuyển','SHIPPING','Vận chuyển được tạo','Đơn hàng {order_code} đã được tạo vận chuyển. Mã vận đơn: {shipment_code}','MEDIUM',1),
(7,'SHIPMENT_ASSIGNED','Thông báo phân công tài xế','SHIPPING','Tài xế được phân công','Đơn hàng {order_code} đã được phân công tài xế {driver_name}.','MEDIUM',1),
(8,'SHIPMENT_DELIVERED','Thông báo giao hàng','SHIPPING','Giao hàng thành công','Đơn hàng {order_code} đã được giao thành công.','HIGH',1),
(9,'IOT_THRESHOLD_EXCEEDED','Cảnh báo IoT','IOT_ALERT','Cảnh báo ngưỡng IoT','Cảnh báo: {metric_type} vượt ngưỡng. Giá trị: {value}, Ngưỡng: {threshold}. Trang trại: {farm_name}','URGENT',1),
(10,'FARM_APPROVED','Thông báo duyệt trang trại','FARM','Trang trại được duyệt','Trang trại {farm_name} của bạn đã được phê duyệt.','HIGH',1),
(11,'FARM_REJECTED','Thông báo từ chối trang trại','FARM','Trang trại bị từ chối','Trang trại {farm_name} không được phê duyệt. Lý do: {reason}','MEDIUM',1),
(12,'BLOCKCHAIN_CONFIRMED','Thông báo xác nhận Blockchain','BLOCKCHAIN','Giao dịch Blockchain xác nhận','Dữ liệu {entity_type} đã được xác nhận trên Blockchain. Mã giao dịch: {tx_hash}','MEDIUM',1);
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
