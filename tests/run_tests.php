<?php
require_once __DIR__ . '/config.test.php';
require_once __DIR__ . '/database/PromotionsTest.php';
require_once __DIR__ . '/database/SpecialistsTest.php';
require_once __DIR__ . '/database/ServicesTest.php';
require_once __DIR__ . '/database/SecurityTest.php';

echo "Starting Database Tests...\n";
echo "========================\n";

// Clean up any existing test data
cleanupTestData($conn);

// Run all tests
$promotionsTest = new PromotionsTest($conn);
$specialistsTest = new SpecialistsTest($conn);
$servicesTest = new ServicesTest($conn);
$securityTest = new SecurityTest($conn);

// Run functional tests first
$promotionsTest->runAll();
$specialistsTest->runAll();
$servicesTest->runAll();

// Run security tests
$securityTest->runAll();

// Clean up test data
cleanupTestData($conn);

echo "\nAll Tests Completed.\n";
echo "========================\n";

// Close connection
$conn->close(); 