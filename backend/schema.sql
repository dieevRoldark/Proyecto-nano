CREATE DATABASE IF NOT EXISTS `portfolio_contact`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `portfolio_contact`;

CREATE TABLE IF NOT EXISTS `contacts` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre`     VARCHAR(100) NOT NULL,
  `apellido`   VARCHAR(100) NOT NULL,
  `email`      VARCHAR(254) NOT NULL,
  `mensaje`    TEXT NOT NULL,
  `ip_address` VARCHAR(45)  DEFAULT NULL,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
