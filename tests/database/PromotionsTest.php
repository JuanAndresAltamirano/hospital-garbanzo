<?php
require_once __DIR__ . '/../config.test.php';

class PromotionsTest {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function runAll() {
        echo "\nRunning Promotions Tests...\n";
        $this->testInsert();
        $this->testSelect();
        $this->testUpdate();
        $this->testDelete();
        echo "Promotions Tests Completed.\n";
    }
    
    private function testInsert() {
        echo "  Testing INSERT... ";
        $title = "Test Promotion " . time();
        $description = "Test Description";
        $image_url = "https://example.com/test.jpg";
        $valid_until = date('Y-m-d', strtotime('+30 days'));
        
        $sql = "INSERT INTO promotions (title, description, image_url, valid_until) 
                VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ssss", $title, $description, $image_url, $valid_until);
        
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
        $stmt = $this->conn->prepare("SELECT * FROM promotions WHERE title LIKE ? LIMIT 1");
        $stmt->bind_param("s", $pattern);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            if ($row['title'] && $row['description'] && $row['image_url'] && $row['valid_until']) {
                echo "✓ Success\n";
                return $row;
            }
        }
        echo "✗ Failed: No test promotion found\n";
        return false;
    }
    
    private function testUpdate() {
        echo "  Testing UPDATE... ";
        $row = $this->testSelect();
        if (!$row) return false;
        
        $new_description = "Updated Test Description";
        $sql = "UPDATE promotions SET description = ? WHERE id = ?";
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
        
        $sql = "DELETE FROM promotions WHERE id = ?";
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