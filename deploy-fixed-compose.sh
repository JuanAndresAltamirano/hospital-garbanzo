#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment with fixed Docker Compose configuration..."

# Create required directories
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p nginx/www
mkdir -p certbot/etc/letsencrypt
mkdir -p certbot/var/www/certbot
mkdir -p uploads
mkdir -p database

# Stop any existing containers and cleanup
echo "Stopping any existing services..."
docker-compose -f docker-compose.prod.yml down || true
docker ps -a | grep "clinica_mullo" | awk '{print $1}' | xargs -r docker rm -f || true

# Make sure we're using our fixed configuration
echo "Using fixed configuration for deployment..."

# Start the services using the fixed configuration
echo "Starting the services..."
docker-compose -f docker-compose.fixed.yml up -d

echo "Waiting for services to start..."
sleep 10

# Check if services are running properly
echo "Checking service status..."
docker-compose -f docker-compose.fixed.yml ps

# Show logs for troubleshooting
echo "Checking logs of backend service..."
docker logs clinica_mullo_backend

echo "Checking logs of frontend service..."
docker logs clinica_mullo_frontend

# Check Nginx configuration
echo "Checking Nginx configuration..."
docker exec clinica_mullo_nginx nginx -t || true

# Apply Nginx configuration
echo "Applying Nginx configuration..."
docker exec clinica_mullo_nginx nginx -s reload || true

echo "Deployment completed successfully!"
echo "Your website should now be accessible at https://clinicamullo.com"
echo ""
echo "To check the status of the services, run:"
echo "docker-compose -f docker-compose.fixed.yml ps"
echo ""
echo "To view logs, run:"
echo "docker logs clinica_mullo_backend"
echo "docker logs clinica_mullo_frontend"
echo ""
echo "To stop the services, run:"
echo "docker-compose -f docker-compose.fixed.yml down" 