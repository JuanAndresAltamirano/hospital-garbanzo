<?php
require_once __DIR__ . '/../config.test.php';

class SecurityTest {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function runAll() {
        echo "\nRunning Security Tests...\n";
        $this->testSQLInjectionInSelect();
        $this->testSQLInjectionInDelete();
        $this->testSQLInjectionInUpdate();
        echo "Security Tests Completed.\n";
    }
    
    private function testSQLInjectionInSelect() {
        echo "  Testing SQL Injection in SELECT... ";
        
        // Malicious input attempts
        $maliciousInputs = [
            "' OR '1'='1",
            "'; DROP TABLE promotions; --",
            "' UNION SELECT * FROM specialists; --",
            "' OR '1'='1' --",
            "'; INSERT INTO promotions (title) VALUES ('hacked'); --"
        ];
        
        foreach ($maliciousInputs as $input) {
            // Test promotions table
            $stmt = $this->conn->prepare("SELECT * FROM promotions WHERE title = ?");
            $stmt->bind_param("s", $input);
            $stmt->execute();
            $result = $stmt->get_result();
            
            // Verify no data was compromised
            if ($result->num_rows > 0) {
                echo "✗ Failed: SQL Injection possible with input: $input\n";
                return false;
            }
            
            // Verify table still exists and structure is intact
            $tableCheck = $this->conn->query("SHOW TABLES LIKE 'promotions'");
            if ($tableCheck->num_rows === 0) {
                echo "✗ Failed: Table was dropped or modified\n";
                return false;
            }
        }
        
        echo "✓ Success\n";
        return true;
    }
    
    private function testSQLInjectionInDelete() {
        echo "  Testing SQL Injection in DELETE... ";
        
        // Insert test data
        $stmt = $this->conn->prepare("INSERT INTO promotions (title, description, image_url, valid_until) VALUES (?, ?, ?, ?)");
        $title = "Test Security Delete";
        $desc = "Test Description";
        $img = "test.jpg";
        $date = date('Y-m-d');
        $stmt->bind_param("ssss", $title, $desc, $img, $date);
        $stmt->execute();
        $safeId = $stmt->insert_id;
        
        // Try malicious delete
        $maliciousId = "1; DELETE FROM promotions; --";
        $stmt = $this->conn->prepare("DELETE FROM promotions WHERE id = ?");
        $stmt->bind_param("i", $maliciousId);
        $stmt->execute();
        
        // Verify other records weren't deleted
        $result = $this->conn->query("SELECT COUNT(*) as count FROM promotions");
        $row = $result->fetch_assoc();
        
        if ($row['count'] == 0) {
            echo "✗ Failed: SQL Injection allowed deletion of all records\n";
            return false;
        }
        
        echo "✓ Success\n";
        return true;
    }
    
    private function testSQLInjectionInUpdate() {
        echo "  Testing SQL Injection in UPDATE... ";
        
        // Insert test data
        $stmt = $this->conn->prepare("INSERT INTO promotions (title, description, image_url, valid_until) VALUES (?, ?, ?, ?)");
        $title = "Test Security Update";
        $desc = "Original Description";
        $img = "test.jpg";
        $date = date('Y-m-d');
        $stmt->bind_param("ssss", $title, $desc, $img, $date);
        $stmt->execute();
        $safeId = $stmt->insert_id;
        
        // Try malicious update
        $maliciousDesc = "hacked'; UPDATE promotions SET description='hacked'; --";
        $stmt = $this->conn->prepare("UPDATE promotions SET description = ? WHERE id = ?");
        $stmt->bind_param("si", $maliciousDesc, $safeId);
        $stmt->execute();
        
        // Verify other records weren't modified
        $result = $this->conn->query("SELECT COUNT(*) as count FROM promotions WHERE description = 'hacked'");
        $row = $result->fetch_assoc();
        
        if ($row['count'] > 1) {
            echo "✗ Failed: SQL Injection allowed mass update\n";
            return false;
        }
        
        echo "✓ Success\n";
        return true;
    }
} 