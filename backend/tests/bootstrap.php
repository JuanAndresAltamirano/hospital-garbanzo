<?php

// Load environment variables from phpunit.xml
$_ENV['DB_HOST'] = $_ENV['DB_HOST'] ?? '172.21.0.2';
$_ENV['DB_DATABASE'] = $_ENV['DB_DATABASE'] ?? 'clinica_mullo';
$_ENV['DB_USERNAME'] = $_ENV['DB_USERNAME'] ?? 'clinica_user';
$_ENV['DB_PASSWORD'] = $_ENV['DB_PASSWORD'] ?? 'clinica_password';

// Create uploads directory if it doesn't exist
$uploadsDir = __DIR__ . '/../uploads';
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0777, true);
}

// Create test images if they don't exist
$testImages = [
    'test-image.jpg',
    'test-image-1.jpg',
    'test-image-2.jpg',
    'test-image-3.jpg'
];

foreach ($testImages as $image) {
    $imagePath = $uploadsDir . '/' . $image;
    if (!file_exists($imagePath)) {
        // Create a simple test image
        $img = imagecreatetruecolor(100, 100);
        $white = imagecolorallocate($img, 255, 255, 255);
        imagefill($img, 0, 0, $white);
        imagejpeg($img, $imagePath);
        imagedestroy($img);
    }
}

// Ensure database connection works
$conn = new mysqli(
    $_ENV['DB_HOST'],
    $_ENV['DB_USERNAME'],
    $_ENV['DB_PASSWORD'],
    $_ENV['DB_DATABASE']
);

if ($conn->connect_error) {
    die('Database connection failed: ' . $conn->connect_error);
}

$conn->close(); 