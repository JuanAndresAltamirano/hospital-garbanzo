-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS clinica_mullo;

-- Grant privileges to root user from any host
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Create application user
CREATE USER IF NOT EXISTS 'dbuser'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON clinica_mullo.* TO 'dbuser'@'%';

-- Update permissions for localhost root user
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password123';

-- Flush privileges to apply changes
FLUSH PRIVILEGES; 