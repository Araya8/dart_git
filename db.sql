-- db.sql — clean & safe for phpMyAdmin (XAMPP/MySQL/MariaDB)

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET sql_notes = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- Create and select database
CREATE DATABASE IF NOT EXISTS expense_app
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE expense_app;

-- Drop old tables (order matters)
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS users;

-- Users (plain password per project spec)
CREATE TABLE users (
  id        SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username  VARCHAR(20)  NOT NULL UNIQUE,
  password  VARCHAR(60)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expenses
CREATE TABLE expenses (
  id       SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id  SMALLINT UNSIGNED NOT NULL,
  item     VARCHAR(50)       NOT NULL,
  paid     MEDIUMINT UNSIGNED NOT NULL,
  date     DATETIME          NOT NULL,
  CONSTRAINT fk_expenses_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data
INSERT INTO users (username, password) VALUES
('Lisa','1111'),
('Tom','2222');

INSERT INTO expenses (user_id, item, paid, date) VALUES
(1,'lunch',   70,  '2025-08-20 12:07:33'),
(1,'coffee',  45,  '2025-08-20 13:07:33'),
(1,'rent',   1600, '2025-08-01 07:26:53'),
(2,'lunch',   50,  '2025-08-20 13:27:39'),
(2,'bun',     20,  '2025-08-20 21:02:36');

SET FOREIGN_KEY_CHECKS = 1;
SET sql_notes = 1;
