-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: bicap_auth_db
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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` enum('ACTIVE','BLOCKED','INACTIVE','PENDING') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'farm.manager@example.com','$2a$10$gMJ/tuz/kuH1L5.f3iLxoeRs8YRyAY70X1PZzOdcSkO1v..ApJ9t6',NULL,'ACTIVE','2025-12-22 16:00:22','farm_manager_test'),(2,'nguyenledaiphi@gmail.com','$2a$10$5czMbiVpu1Phbbfg5wt.heL3jYhVWXSBA1xi3gCgDkVVxFKU0PhHi',NULL,'ACTIVE','2025-12-22 16:00:22','nguyenledaiphi'),(3,'phiproga@gmail.com','$2a$10$NMVFzKIS86MaIMmw7gY5ae6CsZXqkpSJKmZGjZmGKjS.Rsyvml92W',NULL,'ACTIVE','2025-12-22 16:00:22','Nguyen Le Dai Phi'),(4,'Long@gmail.com','$2a$10$8qddQJaBONh8oiRdY6jqE.33NTOuF5RsTs2odQdQxcBAU3K9oxm/C',NULL,'ACTIVE','2025-12-22 16:00:22','nguyenledailong'),(5,'toilab@gmail.com','$2a$10$M.VAJKXu7Xesng2FPulHa.ecQoJuI58q7qgXeOSZR9/ht4YiJ5jkW',NULL,'ACTIVE','2025-12-22 16:00:22','Nguyen Van A'),(6,'nat281205@gmail.com','$2a$10$NrKl8A7AoawOojc.fOguqOefgcSmBlhQ1ns6C5nLF8aBqkSlme6hO',NULL,'ACTIVE','2025-12-22 16:00:22','Long@gmail.com'),(7,'nguyenledaiphi0252005@gmail.com','$2a$10$OPxsvDh5dd0cxWlYQtcBP.tke67Z/AQ6qwDgiOAIe3eAqsQG0rztG',NULL,'ACTIVE','2025-12-22 16:00:22','Nguyen Le Dai Phi'),(11,'manager01@farm.com','$2a$10$en9zqi2Tk3Dn.Zf4OWV9OOGnLJxukBwOB9vRqeJWpqJGb3lDh51nm',NULL,'ACTIVE','2026-01-02 08:56:05','farm_manager_01'),(12,'manage01@farm.com','$2a$10$HMqfplYPge3z6pyLrupgFuxJ4JuR45Vfb2smejjcH6vciQPKrKkga',NULL,'ACTIVE','2026-01-02 08:56:22','farm_manage1_01');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-04 15:20:18
