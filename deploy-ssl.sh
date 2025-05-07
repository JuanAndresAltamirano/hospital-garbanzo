#!/bin/bash

# Exit on any error
set -e

echo "=== Clinica Mullo Deployment Script ==="
echo "This script will deploy your application with SSL certificates"

# Create required directories
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p nginx/www
mkdir -p certbot/etc/letsencrypt
mkdir -p certbot/var/www/certbot
mkdir -p uploads
mkdir -p database

# Create symbolic link for .env
ln -sf .env.production .env

# Step 1: Deploy with initial HTTP configuration
echo "Step 1: Initial deployment with HTTP to obtain SSL certificates"

# Copy initial config (HTTP only) for obtaining SSL certificates
cp nginx/conf.d/default.conf.init nginx/conf.d/default.conf

# Bring down any existing containers
docker-compose -f docker-compose.prod.yml down

# Build and start the containers
docker-compose -f docker-compose.prod.yml up --build -d

echo "Waiting for services to start and for certbot to obtain certificates..."
sleep 30

# Step 2: Deploy with HTTPS configuration
echo "Step 2: Updating configuration for HTTPS"

# Restore the HTTPS configuration
cp nginx/conf.d/default.conf nginx/conf.d/default.conf.bak
cp nginx/conf.d/default.conf.https nginx/conf.d/default.conf

# Restart nginx to apply new configuration
docker exec clinica_mullo_nginx nginx -s reload

echo "=== Deployment completed! ==="
echo "Your website should now be accessible at https://clinicamullo.com" 