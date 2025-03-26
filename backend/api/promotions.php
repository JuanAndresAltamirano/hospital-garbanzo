<?php
require_once '../config.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

function validatePromotion($data) {
    $errors = [];
    
    if (empty($data['title'])) {
        $errors[] = 'Title is required';
    }
    if (empty($data['description'])) {
        $errors[] = 'Description is required';
    }
    if (empty($data['validUntil'])) {
        $errors[] = 'Valid until date is required';
    } elseif (!strtotime($data['validUntil'])) {
        $errors[] = 'Invalid date format for valid until';
    }
    
    return $errors;
}

// Get all promotions
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    try {
        $stmt = $conn->prepare("SELECT * FROM promotions ORDER BY created_at DESC");
        $stmt->execute();
        $result = $stmt->get_result();
        $promotions = [];
        
        while ($row = $result->fetch_assoc()) {
            $promotions[] = $row;
        }
        
        sendResponse($promotions);
    } catch (Exception $e) {
        sendResponse(['error' => 'Failed to fetch promotions: ' . $e->getMessage()], 500);
    }
}

// Create new promotion
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    try {
        // Get and validate input data
        $data = $_POST;
        $errors = validatePromotion($data);
        
        if (!empty($errors)) {
            sendResponse(['errors' => $errors], 400);
        }
        
        $image_url = '';
        // Handle file upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $target_dir = "../uploads/";
            
            // Create uploads directory if it doesn't exist
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }
            
            // Validate file type
            $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
            $file_type = $_FILES['image']['type'];
            if (!in_array($file_type, $allowed_types)) {
                sendResponse(['error' => 'Invalid file type. Only JPG, PNG and GIF are allowed.'], 400);
            }
            
            // Generate safe filename
            $file_extension = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
            $file_name = uniqid() . '.' . $file_extension;
            $target_file = $target_dir . $file_name;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
                $image_url = '/uploads/' . $file_name;
            } else {
                sendResponse(['error' => 'Failed to upload file'], 500);
            }
        } else {
            sendResponse(['error' => 'Image is required'], 400);
        }
        
        // Insert promotion using prepared statement
        $stmt = $conn->prepare("INSERT INTO promotions (title, description, image_url, valid_until) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", 
            $data['title'],
            $data['description'],
            $image_url,
            $data['validUntil']
        );
        
        if ($stmt->execute()) {
            sendResponse([
                'message' => 'Promotion created successfully',
                'id' => $stmt->insert_id
            ], 201);
        } else {
            // If insert fails, remove uploaded image
            if (file_exists($target_file)) {
                unlink($target_file);
            }
            throw new Exception($stmt->error);
        }
    } catch (Exception $e) {
        sendResponse(['error' => 'Failed to create promotion: ' . $e->getMessage()], 500);
    }
}

// Delete promotion
if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            sendResponse(['error' => 'Invalid promotion ID'], 400);
        }
        
        // Get image URL before deleting
        $stmt = $conn->prepare("SELECT image_url FROM promotions WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $image_path = '../' . $row['image_url'];
            if (file_exists($image_path)) {
                unlink($image_path);
            }
        }
        
        // Delete the promotion
        $stmt = $conn->prepare("DELETE FROM promotions WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            sendResponse(['message' => 'Promotion deleted successfully']);
        } else {
            throw new Exception($stmt->error);
        }
    } catch (Exception $e) {
        sendResponse(['error' => 'Failed to delete promotion: ' . $e->getMessage()], 500);
    }
}

$conn->close(); 