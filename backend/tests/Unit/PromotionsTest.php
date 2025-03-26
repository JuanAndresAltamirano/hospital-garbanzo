<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class PromotionsTest extends TestCase
{
    protected $conn;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Set up database connection
        $this->conn = new \mysqli(
            $_ENV['DB_HOST'] ?? '127.0.0.1',
            $_ENV['DB_USERNAME'] ?? 'clinica_user',
            $_ENV['DB_PASSWORD'] ?? 'clinica_password',
            $_ENV['DB_DATABASE'] ?? 'clinica_mullo'
        );

        if ($this->conn->connect_error) {
            $this->markTestSkipped('Could not connect to database: ' . $this->conn->connect_error);
        }

        // Clean up any existing test data
        $this->conn->query("DELETE FROM promotions WHERE title LIKE 'Test%'");
    }

    protected function tearDown(): void
    {
        // Clean up test data
        if ($this->conn) {
            $this->conn->query("DELETE FROM promotions WHERE title LIKE 'Test%'");
            $this->conn->close();
        }
        
        parent::tearDown();
    }

    public function testCanCreatePromotion()
    {
        // Prepare test data
        $title = "Test Promotion " . uniqid();
        $description = "Test Description";
        $validUntil = "2024-12-31";
        $imageUrl = "/uploads/test-image.jpg";

        // Insert test promotion
        $stmt = $this->conn->prepare(
            "INSERT INTO promotions (title, description, image_url, valid_until) VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param("ssss", $title, $description, $imageUrl, $validUntil);
        
        $this->assertTrue($stmt->execute(), "Failed to create promotion: " . $stmt->error);
        $promotionId = $stmt->insert_id;
        $stmt->close();

        // Verify promotion was created
        $stmt = $this->conn->prepare("SELECT * FROM promotions WHERE id = ?");
        $stmt->bind_param("i", $promotionId);
        $stmt->execute();
        $result = $stmt->get_result();
        $promotion = $result->fetch_assoc();
        $stmt->close();

        $this->assertNotNull($promotion);
        $this->assertEquals($title, $promotion['title']);
        $this->assertEquals($description, $promotion['description']);
        $this->assertEquals($imageUrl, $promotion['image_url']);
        $this->assertEquals($validUntil, $promotion['valid_until']);
    }

    public function testCanDeletePromotion()
    {
        // Create a test promotion first
        $title = "Test Promotion " . uniqid();
        $description = "Test Description";
        $validUntil = "2024-12-31";
        $imageUrl = "/uploads/test-image.jpg";

        $stmt = $this->conn->prepare(
            "INSERT INTO promotions (title, description, image_url, valid_until) VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param("ssss", $title, $description, $imageUrl, $validUntil);
        $stmt->execute();
        $promotionId = $stmt->insert_id;
        $stmt->close();

        // Delete the promotion
        $stmt = $this->conn->prepare("DELETE FROM promotions WHERE id = ?");
        $stmt->bind_param("i", $promotionId);
        
        $this->assertTrue($stmt->execute(), "Failed to delete promotion: " . $stmt->error);
        $stmt->close();

        // Verify promotion was deleted
        $stmt = $this->conn->prepare("SELECT * FROM promotions WHERE id = ?");
        $stmt->bind_param("i", $promotionId);
        $stmt->execute();
        $result = $stmt->get_result();
        $promotion = $result->fetch_assoc();
        $stmt->close();

        $this->assertNull($promotion);
    }

    public function testCannotCreatePromotionWithInvalidDate()
    {
        // Prepare test data with invalid date
        $title = "Test Promotion " . uniqid();
        $description = "Test Description";
        $validUntil = "invalid-date";
        $imageUrl = "/uploads/test-image.jpg";

        // Expect mysqli_sql_exception for invalid date
        $this->expectException(\mysqli_sql_exception::class);
        $this->expectExceptionMessage("Incorrect date value: 'invalid-date' for column 'valid_until'");

        // Attempt to insert with invalid date should fail
        $stmt = $this->conn->prepare(
            "INSERT INTO promotions (title, description, image_url, valid_until) VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param("ssss", $title, $description, $imageUrl, $validUntil);
        $stmt->execute();
        $stmt->close();
    }

    public function testCanListPromotions()
    {
        // Create multiple test promotions
        $promotions = [
            [
                'title' => 'Test Promotion 1 ' . uniqid(),
                'description' => 'Test Description 1',
                'valid_until' => '2024-12-31',
                'image_url' => '/uploads/test-image-1.jpg'
            ],
            [
                'title' => 'Test Promotion 2 ' . uniqid(),
                'description' => 'Test Description 2',
                'valid_until' => '2024-12-31',
                'image_url' => '/uploads/test-image-2.jpg'
            ],
            [
                'title' => 'Test Promotion 3 ' . uniqid(),
                'description' => 'Test Description 3',
                'valid_until' => '2024-12-31',
                'image_url' => '/uploads/test-image-3.jpg'
            ]
        ];

        // Insert test promotions
        $stmt = $this->conn->prepare(
            "INSERT INTO promotions (title, description, image_url, valid_until) VALUES (?, ?, ?, ?)"
        );
        
        foreach ($promotions as $promotion) {
            $stmt->bind_param(
                "ssss",
                $promotion['title'],
                $promotion['description'],
                $promotion['image_url'],
                $promotion['valid_until']
            );
            $stmt->execute();
        }
        $stmt->close();

        // Get all test promotions
        $result = $this->conn->query("SELECT * FROM promotions WHERE title LIKE 'Test%' ORDER BY created_at DESC");
        $fetchedPromotions = $result->fetch_all(MYSQLI_ASSOC);

        $this->assertCount(3, $fetchedPromotions);
        
        // Create arrays of titles for comparison
        $expectedTitles = array_map(function($p) { return $p['title']; }, $promotions);
        $actualTitles = array_map(function($p) { return $p['title']; }, $fetchedPromotions);
        
        // Verify that all expected titles are present
        sort($expectedTitles);
        sort($actualTitles);
        $this->assertEquals($expectedTitles, $actualTitles);

        // Verify other fields for each promotion
        foreach ($fetchedPromotions as $fetched) {
            $original = current(array_filter($promotions, function($p) use ($fetched) {
                return $p['title'] === $fetched['title'];
            }));
            
            $this->assertNotNull($original, "Could not find matching promotion for {$fetched['title']}");
            $this->assertEquals($original['description'], $fetched['description']);
            $this->assertEquals($original['image_url'], $fetched['image_url']);
            $this->assertEquals($original['valid_until'], $fetched['valid_until']);
        }
    }
} 