<?php
// Test database configuration
$db_host = getenv('DB_HOST') ?: '172.21.0.2';  // Allow override via environment variable
$db_port = getenv('DB_PORT') ?: '3306';
$db_user = getenv('DB_USER') ?: 'clinica_user';
$db_pass = getenv('DB_PASSWORD') ?: 'clinica_password';
$db_name = getenv('DB_NAME') ?: 'clinica_mullo';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name, (int)$db_port);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Enable error reporting for tests
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to clean up test data
function cleanupTestData($conn) {
    // Clean promotions and services (they use 'title')
    $conn->query("DELETE FROM promotions WHERE title LIKE 'Test%'");
    $conn->query("DELETE FROM services WHERE title LIKE 'Test%'");
    
    // Clean specialists (they use 'name')
    $conn->query("DELETE FROM specialists WHERE name LIKE 'Test%'");
} 