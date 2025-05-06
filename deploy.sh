#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment process..."

# Create required directories
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p nginx/www
mkdir -p certbot/etc/letsencrypt
mkdir -p certbot/var/www/certbot
mkdir -p uploads
mkdir -p database

# Copy the production environment variables
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found!"
    echo "Please create an .env.production file with your configuration."
    exit 1
fi

# Create symbolic link for .env
ln -sf .env.production .env

# Check Docker version
echo "Checking Docker and Docker Compose versions..."
docker --version
docker compose version

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Installing Docker..."
    
    # Update package list
    apt-get update
    
    # Install dependencies
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    
    # Add Docker GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    
    # Add Docker repository
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    
    # Update package list again
    apt-get update
    
    # Install Docker
    apt-get install -y docker-ce
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "Stopping any existing services..."
docker compose -f docker-compose.prod.yml down || true

echo "Starting the build process (this may take some time)..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "Starting the services..."
docker compose -f docker-compose.prod.yml up -d

echo "Waiting for services to start..."
sleep 10

# Check if services are running properly
echo "Checking service status..."
docker compose -f docker-compose.prod.yml ps

# Check logs of any failed services
echo "Checking logs of backend service..."
docker compose -f docker-compose.prod.yml logs backend

echo "Checking logs of frontend service..."
docker compose -f docker-compose.prod.yml logs frontend

# Check if nginx is running
if docker ps | grep -q nginx; then
    echo "Nginx is running properly."
else
    echo "Error: Nginx is not running!"
    echo "Check logs for more details:"
    docker compose -f docker-compose.prod.yml logs nginx
    exit 1
fi

echo "Deployment completed successfully!"
echo "Your website should now be accessible at your domain."
echo ""
echo "To check the status of the services, run:"
echo "docker compose -f docker-compose.prod.yml ps"
echo ""
echo "To view logs, run:"
echo "docker compose -f docker-compose.prod.yml logs -f [service_name]"
echo ""
echo "To stop the services, run:"
echo "docker compose -f docker-compose.prod.yml down" 