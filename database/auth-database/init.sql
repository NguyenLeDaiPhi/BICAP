-- bicap_auth_db_roles.sql
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` enum('ROLE_ADMIN','ROLE_DELIVERY_DRIVER','ROLE_FARM_MANAGER','ROLE_GUEST','ROLE_RETAILER','ROLE_SHIPPING_MANAGER') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
LOCK TABLES `roles` WRITE;
INSERT INTO `roles` VALUES (1,'ROLE_ADMIN'),(2,'ROLE_FARM_MANAGER'),(3,'ROLE_RETAILER'),(4,'ROLE_SHIPPING_MANAGER'),(5,'ROLE_DELIVERY_DRIVER'),(6,'ROLE_GUEST');
UNLOCK TABLES;

-- bicap_auth_db_users.sql
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` enum('ACTIVE','BLOCKED','INACTIVE','PENDING') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1,'farm.manager@example.com','$2a$10$gMJ/tuz/kuH1L5.f3iLxoeRs8YRyAY70X1PZzOdcSkO1v..ApJ9t6','farm_manager_test',NULL,'ACTIVE','2025-12-22 16:00:22',NULL),(2,'nguyenledaiphi@gmail.com','$2a$10$5czMbiVpu1Phbbfg5wt.heL3jYhVWXSBA1xi3gCgDkVVxFKU0PhHi','nguyenledaiphi',NULL,'ACTIVE','2025-12-22 16:00:22',NULL),(3,'phiproga@gmail.com','$2a$10$NMVFzKIS86MaIMmw7gY5ae6CsZXqkpSJKmZGjZmGKjS.Rsyvml92W','Nguyen Le Dai Phi',NULL,'ACTIVE','2025-12-22 16:00:22',NULL),(4,'Long@gmail.com','$2a$10$8qddQJaBONh8oiRdY6jqE.33NTOuF5RsTs2odQdQxcBAU3K9oxm/C','nguyenledailong',NULL,'ACTIVE','2025-12-22 16:00:22',NULL),(5,'toilab@gmail.com','$2a$10$M.VAJKXu7Xesng2FPulHa.ecQoJuI58q7qgXeOSZR9/ht4YiJ5jkW','Nguyen Van A',NULL,'ACTIVE','2025-12-22 16:00:22',NULL),(6,'nat281205@gmail.com','$2a$10$NrKl8A7AoawOojc.fOguqOefgcSmBlhQ1ns6C5nLF8aBqkSlme6hO','Long@gmail.com',NULL,'ACTIVE','2025-12-22 16:00:22',NULL),(7,'nguyenledaiphi0252005@gmail.com','$2a$10$OPxsvDh5dd0cxWlYQtcBP.tke67Z/AQ6qwDgiOAIe3eAqsQG0rztG','Nguyen Le Dai Phi',NULL,'ACTIVE','2025-12-22 16:00:22',NULL);
UNLOCK TABLES;

-- bicap_auth_db_user_roles.sql
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`),
  CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
LOCK TABLES `user_roles` WRITE;
INSERT INTO `user_roles` VALUES (7,1),(1,3),(4,3),(5,3),(6,3),(2,6),(3,6);
UNLOCK TABLES;

-- bicap_auth_db_user_profiles.sql
DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles` (
  `id` bigint NOT NULL,
  `business_license` varchar(255) DEFAULT NULL,
  `address` text,
  `avatar` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
LOCK TABLES `user_profiles` WRITE;
UNLOCK TABLES;
