<?php
require_once __DIR__ . '/../config.test.php';

class ServicesTest {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function runAll() {
        echo "\nRunning Services Tests...\n";
        $this->testInsert();
        $this->testSelect();
        $this->testUpdate();
        $this->testDelete();
        echo "Services Tests Completed.\n";
    }
    
    private function testInsert() {
        echo "  Testing INSERT... ";
        $title = "Test Service " . time();
        $description = "Test Service Description";
        $image_url = "https://example.com/service.jpg";
        
        $sql = "INSERT INTO services (title, description, image_url) 
                VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sss", $title, $description, $image_url);
        
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
        $stmt = $this->conn->prepare("SELECT * FROM services WHERE title LIKE ? LIMIT 1");
        $stmt->bind_param("s", $pattern);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            if ($row['title'] && $row['description']) {
                echo "✓ Success\n";
                return $row;
            }
        }
        echo "✗ Failed: No test service found\n";
        return false;
    }
    
    private function testUpdate() {
        echo "  Testing UPDATE... ";
        $row = $this->testSelect();
        if (!$row) return false;
        
        $new_description = "Updated Test Service Description";
        $sql = "UPDATE services SET description = ? WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $new_description, $row['id']);
        
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
        
        $sql = "DELETE FROM services WHERE id = ?";
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