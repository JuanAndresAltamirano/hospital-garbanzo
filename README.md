# Hospital Garbanzo

A modern hospital management system built with PHP and MySQL.

## Features

- Promotions Management
- Specialists Directory
- Services Catalog
- Secure Database Operations
- Comprehensive Test Suite

## Requirements

- PHP 8.1 or higher
- MySQL 8.0 or higher
- Docker and Docker Compose (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/JuanAndresAltamirano/hospital-garbanzo.git
cd hospital-garbanzo
```

2. Start the MySQL database (using Docker):
```bash
docker-compose up -d
```

3. Initialize the database:
```bash
# The database will be automatically initialized when the Docker container starts
# The initialization script is in database/init.sql
```

## Running Tests

The project includes a comprehensive test suite that covers:
- CRUD operations for all entities
- SQL injection prevention
- Data integrity checks

To run the tests:
```bash
php tests/run_tests.php
```

## Testing

This project includes both frontend and backend tests:

### Frontend Tests (Cypress)

End-to-end tests are written using Cypress. To run the tests:

1. Start the backend server:
```bash
php -S localhost:8000
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Run the tests:
```bash
# Run tests in headless mode
npm test

# Run tests with UI
npm run test:open

# Run tests in CI mode
npm run test:ci
```

### Backend Tests (PHPUnit)

PHP unit tests are located in the `backend/tests` directory. To run the tests:

```bash
cd backend
./vendor/bin/phpunit tests
```

### Continuous Integration

Tests are automatically run on GitHub Actions when:
- Pushing to main/master branch
- Creating a pull request to main/master branch

The CI pipeline:
1. Sets up Node.js and PHP environments
2. Configures MySQL database
3. Runs frontend tests using Cypress
4. Runs backend tests using PHPUnit

Test results and coverage reports are available in the GitHub Actions interface.

## Database Structure

### Promotions Table
- id (INT, AUTO_INCREMENT)
- title (VARCHAR)
- description (TEXT)
- image_url (VARCHAR)
- valid_until (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Specialists Table
- id (INT, AUTO_INCREMENT)
- name (VARCHAR)
- specialty (VARCHAR)
- image_url (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Services Table
- id (INT, AUTO_INCREMENT)
- title (VARCHAR)
- description (TEXT)
- image_url (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Security

The application implements several security measures:
- Prepared statements for all database operations
- Input validation and sanitization
- SQL injection prevention
- Comprehensive security testing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
