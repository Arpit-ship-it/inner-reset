-- ============================================================
-- Database Schema for Inner Reset / Affirmation App
-- Database Type: MySQL
-- Generated for direct database import / phpMyAdmin / MySQL Workbench
-- ============================================================

CREATE DATABASE IF NOT EXISTS `affirmation_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `affirmation_db`;

-- ------------------------------------------------------------
-- 1. Table structure for `Users`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `whatsapp_number` VARCHAR(255) NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'active',
  `utr_number` VARCHAR(255) DEFAULT NULL,
  `isPremium` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `whatsapp_number` (`whatsapp_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Table structure for `user_journeys`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_journeys` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `whatsapp_number` VARCHAR(255) NOT NULL,
  `current_day` INT DEFAULT 1,
  `journey_start_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `last_morning_interaction` DATETIME DEFAULT NULL,
  `morning_choice_today` VARCHAR(255) DEFAULT NULL,
  `afternoon_choice_today` VARCHAR(255) DEFAULT NULL,
  `last_afternoon_interaction` DATETIME DEFAULT NULL,
  `preferred_categories` JSON DEFAULT NULL,
  `companion_name` VARCHAR(255) DEFAULT 'Care Buddy',
  `user_address_name` VARCHAR(255) DEFAULT 'Friend',
  `morning_time` VARCHAR(255) DEFAULT '08:00',
  `afternoon_time` VARCHAR(255) DEFAULT '13:00',
  `evening_time` VARCHAR(255) DEFAULT '20:00',
  `total_interactions` INT DEFAULT 0,
  `morning_response_count` INT DEFAULT 0,
  `mood_patterns` JSON DEFAULT NULL,
  `last_health_msg_index` INT DEFAULT 0,
  `last_relationship_msg_index` INT DEFAULT 0,
  `last_money_msg_index` INT DEFAULT 0,
  `last_career_msg_index` INT DEFAULT 0,
  `last_loneliness_msg_index` INT DEFAULT 0,
  `last_pregnancy_msg_index` INT DEFAULT 0,
  `last_lowenergy_msg_index` INT DEFAULT 0,
  `last_painbody_msg_index` INT DEFAULT 0,
  `last_menopause_msg_index` INT DEFAULT 0,
  `last_life_msg_index` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `whatsapp_number` (`whatsapp_number`),
  CONSTRAINT `fk_user_journeys_whatsapp` FOREIGN KEY (`whatsapp_number`) REFERENCES `Users` (`whatsapp_number`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Table structure for `UserMoods`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `UserMoods` (
  `whatsappId` VARCHAR(255) NOT NULL,
  `lastMood` VARCHAR(255) DEFAULT 'Neutral',
  `interactionCount` INT DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`whatsappId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. Table structure for `Subscriptions`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Subscriptions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `status` ENUM('active', 'inactive') DEFAULT 'inactive',
  `razorpay_order_id` VARCHAR(255) DEFAULT NULL,
  `payment_date` DATETIME DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. Table structure for `MessageLogs`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `MessageLogs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `whatsapp_number` VARCHAR(255) NOT NULL,
  `sender` ENUM('user', 'ai') NOT NULL,
  `message_text` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
