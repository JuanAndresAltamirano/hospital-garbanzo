<?php
require_once 'config.php';

function testConnection($conn) {
    echo "Testing database connection...\n";
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error . "\n");
    }
    echo "Connection successful!\n\n";
}

function testTables($conn) {
    echo "Checking tables...\n";
    $tables = ['promotions', 'specialists', 'services'];
    
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            echo "✓ Table '$table' exists\n";
            // Show table structure
            $structure = $conn->query("DESCRIBE $table");
            echo "  Columns:\n";
            while ($row = $structure->fetch_assoc()) {
                echo "    - {$row['Field']} ({$row['Type']})\n";
            }
            echo "\n";
        } else {
            echo "✗ Table '$table' does not exist\n";
        }
    }
}

// Run tests
testConnection($conn);
testTables($conn);

// Close connection
$conn->close(); 