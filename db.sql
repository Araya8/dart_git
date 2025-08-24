-- Database: expense_app

DROP DATABASE IF EXISTS expense_app;
CREATE DATABASE expense_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE expense_app;

-- Users table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(60) NOT NULL
);

-- Expenses table
DROP TABLE IF EXISTS expenses;
CREATE TABLE expenses (
  id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id SMALLINT UNSIGNED NOT NULL,
  item VARCHAR(50) NOT NULL,
  paid MEDIUMINT UNSIGNED NOT NULL,
  date DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed users
INSERT INTO users (username, password) VALUES
('Lisa','1111'),
('Tom','2222');

-- Seed expenses
INSERT INTO expenses (user_id, item, paid, date) VALUES
(1,'lunch',70,'2025-08-20 12:07:33'),
(1,'coffee',45,'2025-08-20 13:07:33'),
(1,'rent',1600,'2025-08-01 07:26:53'),
(2,'lunch',50,'2025-08-20 13:27:39'),
(2,'bun',20,'2025-08-20 21:02:36');
