CREATE DATABASE IF NOT EXISTS workerlink;
USE workerlink;

-- 1. Users table (stores customers, workers, and admins)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'worker', 'admin') DEFAULT 'user'
);

-- 2. Workers table (stores detailed profile info for workers)
CREATE TABLE IF NOT EXISTS workers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  category VARCHAR(100) NOT NULL,
  experience INT DEFAULT 0,
  rating FLOAT DEFAULT 5.0,
  reviewsCount INT DEFAULT 0,
  distance FLOAT DEFAULT 0.0,
  availability VARCHAR(50) DEFAULT 'Available',
  hourlyRate INT DEFAULT 0,
  dailyRate INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  skills JSON,
  certifications JSON,
  bio TEXT,
  gender VARCHAR(50),
  age INT,
  locality VARCHAR(255),
  specialties JSON,
  calendarSlots JSON
);

-- 3. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  workerId VARCHAR(255) NOT NULL,
  workerName VARCHAR(255) NOT NULL,
  workerCategory VARCHAR(100) NOT NULL,
  workerAvatar TEXT,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL,
  duration INT DEFAULT 1,
  totalAmount INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Pending',
  address TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (workerId) REFERENCES workers(id) ON DELETE CASCADE
);

-- 4. Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id VARCHAR(255) PRIMARY KEY,
  ticketId VARCHAR(50) UNIQUE NOT NULL,
  userType VARCHAR(50) NOT NULL,
  reporterName VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  date VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Open'
);

-- 5. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(255) PRIMARY KEY,
  workerId VARCHAR(255) NOT NULL,
  userName VARCHAR(255) NOT NULL,
  rating INT NOT NULL,
  date VARCHAR(50) NOT NULL,
  comment TEXT NOT NULL,
  FOREIGN KEY (workerId) REFERENCES workers(id) ON DELETE CASCADE
);


