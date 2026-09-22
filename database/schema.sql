-- =======================================================
-- NiVi Collections E-Commerce Platform - Database Initialization
-- MySQL 8.0+
-- =======================================================

CREATE DATABASE IF NOT EXISTS `nivicollections_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nivicollections_db`;

-- Set SQL Modes
SET FOREIGN_KEY_CHECKS = 0;

-- Verification table for Phase 1 connectivity
CREATE TABLE IF NOT EXISTS `system_metadata` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `version` VARCHAR(50) NOT NULL,
    `phase` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO `system_metadata` (`version`, `phase`, `status`)
VALUES ('1.0.0', 'PHASE_1_SETUP', 'INITIALIZED')
ON DUPLICATE KEY UPDATE `status` = 'INITIALIZED';

SET FOREIGN_KEY_CHECKS = 1;
