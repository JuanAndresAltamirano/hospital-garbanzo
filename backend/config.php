<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$db_host = '172.21.0.2';  // Docker container IP
$db_user = 'clinica_user';
$db_pass = 'clinica_password';
$db_name = 'clinica_mullo';
$db_port = 3306;  // Use default MySQL port since we're connecting directly to the container

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name, $db_port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 