-- BICAP IoT Database Schema
-- Database: bicap_iot_db
-- Service: IoT Service
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
-- Table: iot_devices
-- Description: IoT devices registered in the system
-- ------------------------------------------------------
DROP TABLE IF EXISTS `iot_devices`;
CREATE TABLE `iot_devices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `device_code` varchar(100) NOT NULL,
  `device_name` varchar(255) NOT NULL,
  `device_type` enum('SENSOR','CAMERA','GATEWAY','ACTUATOR') NOT NULL DEFAULT 'SENSOR',
  `manufacturer` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `firmware_version` varchar(50) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','MAINTENANCE','FAULTY') NOT NULL DEFAULT 'ACTIVE',
  `farm_id` bigint NOT NULL COMMENT 'Reference to farm in Farm Service',
  `location` varchar(255) DEFAULT NULL COMMENT 'Location within farm',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `last_heartbeat` datetime(6) DEFAULT NULL,
  `battery_level` decimal(5,2) DEFAULT NULL COMMENT 'Battery percentage',
  `installation_date` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_device_code` (`device_code`),
  INDEX `idx_iot_devices_farm` (`farm_id`),
  INDEX `idx_iot_devices_status` (`status`),
  INDEX `idx_iot_devices_type` (`device_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: sensor_readings
-- Description: Environmental sensor readings data
-- ------------------------------------------------------
DROP TABLE IF EXISTS `sensor_readings`;
CREATE TABLE `sensor_readings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `device_id` bigint NOT NULL,
  `farm_id` bigint NOT NULL COMMENT 'Denormalized for query performance',
  `production_batch_id` bigint DEFAULT NULL COMMENT 'Reference to production batch',
  `metric_type` enum('TEMPERATURE','HUMIDITY','PH','LIGHT','SOIL_MOISTURE','CO2','RAINFALL','WIND_SPEED') NOT NULL,
  `value` decimal(10,4) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `recorded_at` datetime(6) NOT NULL COMMENT 'Timestamp when reading was taken',
  `quality` enum('GOOD','DOUBTFUL','BAD') NOT NULL DEFAULT 'GOOD',
  `is_anomaly` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Flagged as anomalous',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_sensor_readings_device` (`device_id`),
  INDEX `idx_sensor_readings_farm` (`farm_id`),
  INDEX `idx_sensor_readings_batch` (`production_batch_id`),
  INDEX `idx_sensor_readings_metric` (`metric_type`),
  INDEX `idx_sensor_readings_recorded` (`recorded_at`),
  INDEX `idx_sensor_readings_composite` (`farm_id`, `metric_type`, `recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: threshold_configs
-- Description: IoT threshold configurations for alerts
-- ------------------------------------------------------
DROP TABLE IF EXISTS `threshold_configs`;
CREATE TABLE `threshold_configs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `farm_id` bigint NOT NULL,
  `production_batch_id` bigint DEFAULT NULL COMMENT 'Null means applies to all batches in farm',
  `metric_type` enum('TEMPERATURE','HUMIDITY','PH','LIGHT','SOIL_MOISTURE','CO2','RAINFALL','WIND_SPEED') NOT NULL,
  `min_value` decimal(10,4) DEFAULT NULL,
  `max_value` decimal(10,4) DEFAULT NULL,
  `ideal_min` decimal(10,4) DEFAULT NULL COMMENT 'Ideal minimum value',
  `ideal_max` decimal(10,4) DEFAULT NULL COMMENT 'Ideal maximum value',
  `unit` varchar(20) NOT NULL,
  `severity` enum('INFO','WARNING','CRITICAL') NOT NULL DEFAULT 'WARNING',
  `notification_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `auto_action_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `action_type` varchar(100) DEFAULT NULL COMMENT 'e.g., TURN_ON_IRRIGATION',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_threshold_config` (`farm_id`, `production_batch_id`, `metric_type`),
  INDEX `idx_threshold_configs_farm` (`farm_id`),
  INDEX `idx_threshold_configs_batch` (`production_batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: iot_alerts
-- Description: Generated IoT alerts when thresholds are exceeded
-- ------------------------------------------------------
DROP TABLE IF EXISTS `iot_alerts`;
CREATE TABLE `iot_alerts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `device_id` bigint NOT NULL,
  `farm_id` bigint NOT NULL,
  `production_batch_id` bigint DEFAULT NULL,
  `threshold_config_id` bigint DEFAULT NULL,
  `metric_type` enum('TEMPERATURE','HUMIDITY','PH','LIGHT','SOIL_MOISTURE','CO2','RAINFALL','WIND_SPEED') NOT NULL,
  `actual_value` decimal(10,4) NOT NULL,
  `threshold_value` decimal(10,4) NOT NULL,
  `threshold_type` enum('MIN','MAX') NOT NULL,
  `severity` enum('INFO','WARNING','CRITICAL') NOT NULL DEFAULT 'WARNING',
  `status` enum('TRIGGERED','ACKNOWLEDGED','RESOLVED','IGNORED') NOT NULL DEFAULT 'TRIGGERED',
  `triggered_at` datetime(6) NOT NULL,
  `acknowledged_at` datetime(6) DEFAULT NULL,
  `acknowledged_by` bigint DEFAULT NULL COMMENT 'User who acknowledged',
  `resolved_at` datetime(6) DEFAULT NULL,
  `resolution_note` text DEFAULT NULL,
  `notification_sent` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_iot_alerts_device` (`device_id`),
  INDEX `idx_iot_alerts_farm` (`farm_id`),
  INDEX `idx_iot_alerts_batch` (`production_batch_id`),
  INDEX `idx_iot_alerts_status` (`status`),
  INDEX `idx_iot_alerts_severity` (`severity`),
  INDEX `idx_iot_alerts_triggered` (`triggered_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: sensor_statistics
-- Description: Aggregated statistics for sensor readings
-- ------------------------------------------------------
DROP TABLE IF EXISTS `sensor_statistics`;
CREATE TABLE `sensor_statistics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `farm_id` bigint NOT NULL,
  `production_batch_id` bigint DEFAULT NULL,
  `metric_type` enum('TEMPERATURE','HUMIDITY','PH','LIGHT','SOIL_MOISTURE','CO2','RAINFALL','WIND_SPEED') NOT NULL,
  `period_type` enum('HOURLY','DAILY','WEEKLY','MONTHLY') NOT NULL,
  `period_start` datetime(6) NOT NULL,
  `period_end` datetime(6) NOT NULL,
  `min_value` decimal(10,4) NOT NULL,
  `max_value` decimal(10,4) NOT NULL,
  `avg_value` decimal(10,4) NOT NULL,
  `std_dev` decimal(10,4) DEFAULT NULL,
  `reading_count` int NOT NULL,
  `anomaly_count` int NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_sensor_stats` (`farm_id`, `production_batch_id`, `metric_type`, `period_type`, `period_start`),
  INDEX `idx_sensor_stats_farm` (`farm_id`),
  INDEX `idx_sensor_stats_batch` (`production_batch_id`),
  INDEX `idx_sensor_stats_period` (`period_type`, `period_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table: device_commands
-- Description: Commands sent to IoT devices (for actuators)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `device_commands`;
CREATE TABLE `device_commands` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `device_id` bigint NOT NULL,
  `command_type` varchar(100) NOT NULL,
  `command_payload` text DEFAULT NULL,
  `status` enum('PENDING','SENT','ACKNOWLEDGED','COMPLETED','FAILED','TIMEOUT') NOT NULL DEFAULT 'PENDING',
  `priority` enum('LOW','NORMAL','HIGH','CRITICAL') NOT NULL DEFAULT 'NORMAL',
  `sent_at` datetime(6) DEFAULT NULL,
  `acknowledged_at` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `result_message` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_device_commands_device` (`device_id`),
  INDEX `idx_device_commands_status` (`status`),
  INDEX `idx_device_commands_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Insert default threshold configurations
-- ------------------------------------------------------
LOCK TABLES `threshold_configs` WRITE;
INSERT INTO `threshold_configs` (`farm_id`, `production_batch_id`, `metric_type`, `min_value`, `max_value`, `ideal_min`, `ideal_max`, `unit`, `severity`) VALUES
-- Temperature thresholds (Celsius)
(0, NULL, 'TEMPERATURE', 10, 40, 20, 30, '°C', 'WARNING'),
-- Humidity thresholds (percentage)
(0, NULL, 'HUMIDITY', 30, 90, 50, 70, '%', 'WARNING'),
-- pH thresholds
(0, NULL, 'PH', 5.5, 8.5, 6.0, 7.5, 'pH', 'WARNING'),
-- Soil moisture thresholds (percentage)
(0, NULL, 'SOIL_MOISTURE', 20, 80, 40, 60, '%', 'WARNING'),
-- Light thresholds (lux)
(0, NULL, 'LIGHT', 1000, 100000, 10000, 50000, 'lux', 'INFO'),
-- CO2 thresholds (ppm)
(0, NULL, 'CO2', 350, 1000, 400, 600, 'ppm', 'WARNING');
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
