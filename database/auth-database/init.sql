-- Create roles table
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` enum('ROLE_ADMIN','ROLE_DELIVERY_DRIVER','ROLE_FARM_MANAGER','ROLE_GUEST','ROLE_RETAILER','ROLE_SHIPPING_MANAGER') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert data into roles
LOCK TABLES `roles` WRITE;
INSERT INTO `roles` VALUES (1,'ROLE_ADMIN'),(2,'ROLE_FARM_MANAGER'),(3,'ROLE_RETAILER'),(4,'ROLE_SHIPPING_MANAGER'),(5,'ROLE_DELIVERY_DRIVER'),(6,'ROLE_GUEST');
UNLOCK TABLES;

-- Create users table
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','BLOCKED','INACTIVE','PENDING') DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert data into users
LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1,'farm.manager@example.com','$2a$10$gMJ/tuz/kuH1L5.f3iLxoeRs8YRyAY70X1PZzOdcSkO1v..ApJ9t6','ACTIVE','farm_manager_test');
UNLOCK TABLES;

-- Create user_roles table
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`),
  CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert data into user_roles
LOCK TABLES `user_roles` WRITE;
INSERT INTO `user_roles` VALUES (1,3);
UNLOCK TABLES;
