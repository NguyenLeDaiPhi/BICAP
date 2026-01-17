-- MySQL dump 10.13  Distrib 8.0.42, for macos15 (arm64)
--
-- Host: localhost    Database: farm_management_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `environment_metrics`
--

DROP TABLE IF EXISTS `environment_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `environment_metrics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `metric_type` varchar(255) DEFAULT NULL,
  `recorded_at` datetime(6) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `value` double DEFAULT NULL,
  `farm_id` bigint NOT NULL,
  `production_batch_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKq0xiurjloeahrafjktub0kod2` (`farm_id`),
  KEY `FK8hh7wq8ighqlxyaf86d5uxc9s` (`production_batch_id`),
  CONSTRAINT `FK8hh7wq8ighqlxyaf86d5uxc9s` FOREIGN KEY (`production_batch_id`) REFERENCES `production_batches` (`id`),
  CONSTRAINT `FKq0xiurjloeahrafjktub0kod2` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `environment_metrics`
--

LOCK TABLES `environment_metrics` WRITE;
/*!40000 ALTER TABLE `environment_metrics` DISABLE KEYS */;
INSERT INTO `environment_metrics` VALUES (1,'AUTO_WEATHER','2025-12-31 00:50:00.183245','Celsius',25.04,1,1),(2,'TEMPERATURE','2025-12-31 01:02:24.261053','Celsius',25.04,1,2),(3,'HUMIDITY','2025-12-31 01:02:24.261053','%',80,1,2);
/*!40000 ALTER TABLE `environment_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `export_batches`
--

DROP TABLE IF EXISTS `export_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `export_batches` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `export_code` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `export_date` datetime(6) DEFAULT NULL,
  `qr_code_image` text,
  `qr_code` text,
  `quantity` double DEFAULT NULL,
  `tx_hash` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `batch_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_htn175kpm7cd45jlore6oym1v` (`export_code`),
  KEY `FK9yobnh5yfd3xdkbcb5kwhpgjl` (`batch_id`),
  CONSTRAINT `FK9yobnh5yfd3xdkbcb5kwhpgjl` FOREIGN KEY (`batch_id`) REFERENCES `production_batches` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `export_batches`
--

LOCK TABLES `export_batches` WRITE;
/*!40000 ALTER TABLE `export_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `export_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farming_processes`
--

DROP TABLE IF EXISTS `farming_processes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `farming_processes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `performed_date` datetime(6) DEFAULT NULL,
  `process_type` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `tx_hash` varchar(255) DEFAULT NULL,
  `production_batch_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcscp7rp661axid1a86yvy2iiu` (`production_batch_id`),
  CONSTRAINT `FKcscp7rp661axid1a86yvy2iiu` FOREIGN KEY (`production_batch_id`) REFERENCES `production_batches` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farming_processes`
--

LOCK TABLES `farming_processes` WRITE;
/*!40000 ALTER TABLE `farming_processes` DISABLE KEYS */;
/*!40000 ALTER TABLE `farming_processes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farms`
--

DROP TABLE IF EXISTS `farms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `farms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` text,
  `created_at` datetime(6) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `hotline` varchar(25) NOT NULL,
  `acreage` double DEFAULT NULL,
  `description` text DEFAULT NULL,
  `owner_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farms`
--

LOCK TABLES `farms` WRITE;
/*!40000 ALTER TABLE `farms` DISABLE KEYS */;
INSERT INTO `farms` (`id`, `address`, `created_at`, `name`, `email`, `hotline`, `acreage`, `description`, `owner_id`) VALUES (1,'Đà Lạt','2025-12-31 00:48:43.696330','Farm Test Thời Tiết', 'farm1@example.com', '123456789', 10.5, 'A test farm',101),(2,'Đà Lạt','2025-12-31 01:01:28.134243','Farm Test Thời Tiết 2', 'farm2@example.com', '987654321', 20.0, 'Another test farm',101);
/*!40000 ALTER TABLE `farms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_listings`
--

DROP TABLE IF EXISTS `product_listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_listings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `available_quantity` double DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `listed_at` datetime(6) DEFAULT NULL,
  `price_per_unit` double DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `export_batch_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_38n67eumcnu89xnb4lwul0ugj` (`export_batch_id`),
  CONSTRAINT `FKc4ms1r0k7v24w9qekhx9dts36` FOREIGN KEY (`export_batch_id`) REFERENCES `export_batches` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_listings`
--

LOCK TABLES `product_listings` WRITE;
/*!40000 ALTER TABLE `product_listings` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production_batches`
--

DROP TABLE IF EXISTS `production_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_batches` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `batch_code` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `product_type` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `tx_hash` varchar(255) DEFAULT NULL,
  `farm_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK8qwvn2ve40v3tbde1q47dwxqa` (`farm_id`),
  CONSTRAINT `FK8qwvn2ve40v3tbde1q47dwxqa` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_batches`
--

LOCK TABLES `production_batches` WRITE;
/*!40000 ALTER TABLE `production_batches` DISABLE KEYS */;
INSERT INTO `production_batches` VALUES (1,'BATCH-NEW-01','2025-12-31 00:49:38.499226','2025-04-01','Dưa Lưới','2025-01-01','SYNCED','0xa82e959a0838fcf...',1),(2,'BATCH-NEW-01','2025-12-31 01:01:59.205375','2025-04-01','Dưa Lưới','2025-01-01','SYNCED','0x1d950dbf57cbe0f...',1);
/*!40000 ALTER TABLE `production_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `note` varchar(255) DEFAULT NULL,
  `order_date` datetime(6) DEFAULT NULL,
  `quantity` double DEFAULT NULL,
  `retailer_id` bigint DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total_price` double DEFAULT NULL,
  `listing_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKeb195cfiv83axx2x3ovm6gmmd` (`listing_id`),
  CONSTRAINT `FKeb195cfiv83axx2x3ovm6gmmd` FOREIGN KEY (`listing_id`) REFERENCES `product_listings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-31 15:10:04
