#!/bin/bash

# Exit on any error
set -e

echo "===================================================="
echo "Simple deployment script for Clinica Mullo"
echo "===================================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root (using sudo)"
  exit 1
fi

# Make sure deploy script is executable
chmod +x deploy-clinicamullo.sh

# Clean up any existing issues
echo "Cleaning up any existing containers..."
docker-compose -f docker-compose.prod.yml down || true

# Remove any conflicting containers
if docker ps -a --format '{{.Names}}' | grep -q "clinica_mullo_db"; then
    echo "Removing existing database container..."
    docker rm -f clinica_mullo_db
fi

if docker ps -a --format '{{.Names}}' | grep -q "nginx"; then
    echo "Removing existing nginx container..."
    docker rm -f nginx
fi

# Fix permissions on certbot directories
echo "Setting up proper permissions..."
mkdir -p certbot/etc/letsencrypt
mkdir -p certbot/var/www/certbot
chmod -R 755 certbot

# Run the full deployment script
echo "Starting main deployment process..."
./deploy-clinicamullo.sh

echo "===================================================="
echo "Deployment finished. If there were errors, check the logs with:"
echo "docker-compose -f docker-compose.prod.yml logs"
echo "====================================================" 