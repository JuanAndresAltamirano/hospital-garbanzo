<?php
require_once '../config.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get all promotions
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT * FROM promotions ORDER BY created_at DESC";
    $result = $conn->query($sql);
    
    $promotions = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $promotions[] = $row;
        }
    }
    
    echo json_encode($promotions);
}

// Create new promotion
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Handle file upload
    if (isset($_FILES['image'])) {
        $target_dir = "../uploads/";
        $file_extension = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
        $file_name = uniqid() . '.' . $file_extension;
        $target_file = $target_dir . $file_name;
        
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            $image_url = '/uploads/' . $file_name;
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to upload file']);
            exit();
        }
    }
    
    $title = $conn->real_escape_string($data['title']);
    $description = $conn->real_escape_string($data['description']);
    $valid_until = $conn->real_escape_string($data['validUntil']);
    $image_url = $conn->real_escape_string($image_url);
    
    $sql = "INSERT INTO promotions (title, description, image_url, valid_until) 
            VALUES ('$title', '$description', '$image_url', '$valid_until')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(['message' => 'Promotion created successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => $conn->error]);
    }
}

// Delete promotion
if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];
    
    // Get image URL before deleting
    $sql = "SELECT image_url FROM promotions WHERE id = $id";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $image_path = '../' . $row['image_url'];
        if (file_exists($image_path)) {
            unlink($image_path);
        }
    }
    
    $sql = "DELETE FROM promotions WHERE id = $id";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(['message' => 'Promotion deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => $conn->error]);
    }
}

$conn->close(); 