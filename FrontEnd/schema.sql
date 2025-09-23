-- UniPlay Database Schema
--
-- This script creates the tables for managing users, sports, events,
-- teams, and registrations for the university sports hub.

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `uniplay_db`;
USE `uniplay_db`;

-- --------------------------------------------------------

--
-- Table structure for table `users`
-- Stores user information, including players and organizers.
--
CREATE TABLE `users` (
  `user_id` INT PRIMARY KEY AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL, -- IMPORTANT: Always store hashed passwords, never plain text.
  `role` ENUM('player', 'organizer', 'admin') NOT NULL DEFAULT 'player',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

--
-- Table structure for table `sports`
-- Stores the different types of sports and games available.
--
CREATE TABLE `sports` (
  `sport_id` INT PRIMARY KEY AUTO_INCREMENT,
  `sport_name` VARCHAR(50) NOT NULL UNIQUE
);

-- --------------------------------------------------------

--
-- Table structure for table `teams`
-- Stores team information, with a link to the user who is the captain.
--
CREATE TABLE `teams` (
  `team_id` INT PRIMARY KEY AUTO_INCREMENT,
  `team_name` VARCHAR(100) NOT NULL UNIQUE,
  `captain_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`captain_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
);

-- --------------------------------------------------------

--
-- Table structure for table `teammembers`
-- This is a linking table to handle the many-to-many relationship between teams and users (players).
--
CREATE TABLE `teammembers` (
  `team_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `join_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`team_id`, `user_id`),
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`team_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
);

-- --------------------------------------------------------

--
-- Table structure for table `events`
-- Stores details for all sporting and gaming events.
--
CREATE TABLE `events` (
  `event_id` INT PRIMARY KEY AUTO_INCREMENT,
  `event_name` VARCHAR(150) NOT NULL,
  `sport_id` INT NOT NULL,
  `organizer_id` INT NOT NULL,
  `start_date` DATETIME NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `image_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`sport_id`) REFERENCES `sports`(`sport_id`),
  FOREIGN KEY (`organizer_id`) REFERENCES `users`(`user_id`)
);

-- --------------------------------------------------------

--
-- Table structure for table `eventregistrations`
-- Tracks which teams are registered for which events.
--
CREATE TABLE `eventregistrations` (
  `registration_id` INT PRIMARY KEY AUTO_INCREMENT,
  `event_id` INT NOT NULL,
  `team_id` INT NOT NULL,
  `registration_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (`event_id`, `team_id`), -- Prevents a team from registering for the same event twice.
  FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE CASCADE,
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`team_id`) ON DELETE CASCADE
);

-- --------------------------------------------------------

--
-- Table structure for table `news`
-- Stores news articles and highlights.
--
CREATE TABLE `news` (
  `article_id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `author_id` INT NOT NULL,
  `image_url` VARCHAR(255),
  `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`author_id`) REFERENCES `users`(`user_id`)
);

-- Add some initial data for the sports
INSERT INTO `sports` (`sport_name`) VALUES
('Cricket'),
('Football'),
('Basketball'),
('E-Sports'),
('Chess'),
('Volleyball'),
('Badminton');