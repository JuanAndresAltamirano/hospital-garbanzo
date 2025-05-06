#!/bin/bash

# Exit on error
set -e

echo "===================================================="
echo "FRONTEND FIX SCRIPT FOR CLINICA MULLO"
echo "===================================================="

# Navigate to project directory
cd "$(dirname "$0")"
echo "Working in directory: $(pwd)"

# Create a simplified nginx config without SSL references
echo "Creating simplified Nginx config..."
mkdir -p nginx/conf.d
cat > nginx/conf.d/frontend.conf << 'EOL'
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
EOL

# Remove existing frontend containers
echo "Removing existing frontend containers..."
docker ps -a | grep frontend | awk '{print $1}' | xargs docker rm -f 2>/dev/null || true
docker rm -f f25d7e11465 2>/dev/null || true
docker rm -f clinica_mullo_frontend 2>/dev/null || true

# Get the network name
NETWORK_NAME=$(docker network ls --format "{{.Name}}" | grep app-network)
if [ -z "$NETWORK_NAME" ]; then
  echo "Creating network..."
  docker network create hospital-garbanzo_app-network
  NETWORK_NAME="hospital-garbanzo_app-network"
fi
echo "Using network: $NETWORK_NAME"

# Create a simple Dockerfile for frontend
echo "Creating simplified Dockerfile..."
cat > Dockerfile.frontend.simple << 'EOL'
# Build stage
FROM node:18 AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Use simple configuration
COPY nginx/conf.d/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOL

# Build and run the frontend
echo "Building frontend with Node 18..."
docker build -t frontend-simple -f Dockerfile.frontend.simple .

echo "Starting frontend container..."
docker run -d --name frontend_simple --network "$NETWORK_NAME" --restart always frontend-simple

# Check that it's running
echo "Checking container status..."
docker ps | grep frontend_simple

echo "===================================================="
echo "FRONTEND FIX COMPLETED SUCCESSFULLY"
echo ""
echo "To check logs: docker logs frontend_simple"
echo "====================================================" 