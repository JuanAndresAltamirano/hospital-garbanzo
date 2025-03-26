<?php
require_once __DIR__ . '/../config.test.php';

class SpecialistsTest {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function runAll() {
        echo "\nRunning Specialists Tests...\n";
        $this->testInsert();
        $this->testSelect();
        $this->testUpdate();
        $this->testDelete();
        echo "Specialists Tests Completed.\n";
    }
    
    private function testInsert() {
        echo "  Testing INSERT... ";
        $name = "Test Doctor " . time();
        $specialty = "Test Specialty";
        $image_url = "https://example.com/doctor.jpg";
        $description = "Test Doctor Description";
        
        $sql = "INSERT INTO specialists (name, specialty, image_url, description) 
                VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ssss", $name, $specialty, $image_url, $description);
        
        if ($stmt->execute()) {
            echo "✓ Success\n";
            return $stmt->insert_id;
        } else {
            echo "✗ Failed: " . $stmt->error . "\n";
            return false;
        }
    }
    
    private function testSelect() {
        echo "  Testing SELECT... ";
        $pattern = "Test%";
        $stmt = $this->conn->prepare("SELECT * FROM specialists WHERE name LIKE ? LIMIT 1");
        $stmt->bind_param("s", $pattern);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            if ($row['name'] && $row['specialty']) {
                echo "✓ Success\n";
                return $row;
            }
        }
        echo "✗ Failed: No test specialist found\n";
        return false;
    }
    
    private function testUpdate() {
        echo "  Testing UPDATE... ";
        $row = $this->testSelect();
        if (!$row) return false;
        
        $new_specialty = "Updated Test Specialty";
        $sql = "UPDATE specialists SET specialty = ? WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $new_specialty, $row['id']);
        
        if ($stmt->execute()) {
            echo "✓ Success\n";
            return true;
        } else {
            echo "✗ Failed: " . $stmt->error . "\n";
            return false;
        }
    }
    
    private function testDelete() {
        echo "  Testing DELETE... ";
        $row = $this->testSelect();
        if (!$row) return false;
        
        $sql = "DELETE FROM specialists WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $row['id']);
        
        if ($stmt->execute()) {
            echo "✓ Success\n";
            return true;
        } else {
            echo "✗ Failed: " . $stmt->error . "\n";
            return false;
        }
    }
} 