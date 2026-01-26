-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: bicap_order_db
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `marketplace_products`
--

DROP TABLE IF EXISTS `marketplace_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketplace_products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `batch_id` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `farm_manager_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKimf0ebijwdto6ebsgvik6flmx` (`farm_manager_id`),
  CONSTRAINT `FKimf0ebijwdto6ebsgvik6flmx` FOREIGN KEY (`farm_manager_id`) REFERENCES `farm_manager` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketplace_products`
--

LOCK TABLES `marketplace_products` WRITE;
/*!40000 ALTER TABLE `marketplace_products` DISABLE KEYS */;
INSERT INTO `marketplace_products` VALUES 
(1,'BATCH-2026-001','Rau củ','2026-01-25 10:00:00.000000','Cà chua đỏ tươi từ trang trại hữu cơ, không thuốc trừ sâu','https://images.unsplash.com/photo-1546470427-227c7369a9a9?w=400','Cà chua hữu cơ',45000,100,'PENDING','kg',1),
(2,'BATCH-2026-002','Rau củ','2026-01-25 11:00:00.000000','Dưa leo tươi giòn, trồng theo phương pháp thủy canh','https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400','Dưa leo sạch',25000,150,'PENDING','kg',1),
(3,'BATCH-2026-003','Trái cây','2026-01-25 12:00:00.000000','Xoài cát Hòa Lộc chín cây, ngọt thanh tự nhiên','https://images.unsplash.com/photo-1553279768-865429fa0078?w=400','Xoài cát Hòa Lộc',65000,80,'PENDING','kg',1),
(4,'BATCH-2026-004','Rau lá','2026-01-25 13:00:00.000000','Rau muống nước tươi xanh, thu hoạch sáng sớm','https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400','Rau muống nước',15000,200,'PENDING','bó',2),
(5,'BATCH-2026-005','Trái cây','2026-01-25 14:00:00.000000','Thanh long ruột đỏ Bình Thuận, ngọt dịu tự nhiên','https://images.unsplash.com/photo-1527325678964-54921661f888?w=400','Thanh long ruột đỏ',55000,120,'PENDING','kg',2),
(6,'BATCH-2026-006','Gia vị','2026-01-25 15:00:00.000000','Gừng tươi Đà Lạt, vị cay nồng đậm đà','https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400','Gừng tươi Đà Lạt',40000,50,'ACTIVE','kg',1),
(7,'BATCH-2026-007','Rau củ','2026-01-25 16:00:00.000000','Khoai lang mật vàng ruột cam, ngọt bùi','https://images.unsplash.com/photo-1596097635121-14b63a7a7e20?w=400','Khoai lang mật',30000,100,'ACTIVE','kg',2);
/*!40000 ALTER TABLE `marketplace_products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-19 13:46:40
