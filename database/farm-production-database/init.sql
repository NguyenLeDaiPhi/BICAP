CREATE DATABASE IF NOT EXISTS farm_production_db;
USE farm_production_db;

CREATE TABLE IF NOT EXISTS `farming_seasons` (
  `batch_id` INT NOT NULL AUTO_INCREMENT,
  `farm_id` INT NOT NULL,
  `season_name` VARCHAR(255) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`batch_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `products` (
  `product_id` INT NOT NULL AUTO_INCREMENT,
  `product_name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `description` TEXT,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `unit` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `batch_id` INT,
  `farm_id` INT NOT NULL,
  `image_url` VARCHAR(512),
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  FOREIGN KEY (`batch_id`) REFERENCES `farming_seasons`(`batch_id`)
) ENGINE=InnoDB;

-- Insert sample data for farming seasons
INSERT INTO `farming_seasons` (`farm_id`, `season_name`, `start_date`, `end_date`, `description`) VALUES
(1, 'Spring 2025 Rice Crop', '2025-03-01', '2025-07-31', 'Main rice cultivation season for the year.'),
(1, 'Autumn 2025 Vegetable Patch', '2025-08-15', '2025-11-30', 'Growing various organic vegetables.'),
(2, 'Summer 2025 Corn Field', '2025-06-01', '2025-09-15', 'Field dedicated to sweet corn production.');

-- Insert sample data for products
INSERT INTO `products` (`product_name`, `category`, `description`, `quantity`, `unit`, `price`, `batch_id`, `farm_id`, `status`) VALUES
('Organic Jasmine Rice', 'Grains', 'High-quality, fragrant organic jasmine rice from the spring harvest.', 500.00, 'kg', 2.50, 1, 1, 'APPROVED'),
('Heirloom Tomatoes', 'Vegetables', 'A mix of colorful and flavorful heirloom tomatoes.', 75.50, 'kg', 4.00, 2, 1, 'PENDING'),
('Sweet Corn', 'Vegetables', 'Fresh and sweet corn on the cob, perfect for grilling.', 2000.00, 'piece', 0.50, 3, 2, 'APPROVED'),
('Kale', 'Vegetables', 'Nutrient-rich kale, great for salads and smoothies.', 30.00, 'kg', 3.00, 2, 1, 'REJECTED');

