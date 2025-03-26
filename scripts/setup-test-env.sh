#!/bin/bash

# Create uploads directory if it doesn't exist
mkdir -p backend/uploads
chmod -R 777 backend/uploads

# Kill any existing PHP servers on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Kill any existing Vite servers on port 5174
lsof -ti:5174 | xargs kill -9 2>/dev/null || true

# Start PHP server
php -S localhost:8000 &
echo "PHP server started on port 8000"

# Start frontend
npm run dev &
echo "Frontend server started on port 5174"

# Wait for servers to be ready
echo "Waiting for servers to start..."
while ! nc -z localhost 8000; do sleep 1; done
while ! nc -z localhost 5174; do sleep 1; done
echo "Both servers are running!"

# Run Cypress tests
echo "Running Cypress tests..."
npm run test 