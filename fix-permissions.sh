#!/bin/bash

# This script fixes common permission issues with Docker volumes

echo "Fixing permissions for Docker volumes and directories..."

# Create directories if they don't exist
mkdir -p uploads
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p nginx/www
mkdir -p certbot/etc/letsencrypt
mkdir -p certbot/var/www/certbot
mkdir -p database

# Fix permissions
echo "Setting correct permissions..."
chmod -R 755 uploads
chmod -R 755 nginx
chmod -R 755 certbot
chmod -R 755 database

# If running in Docker container, change ownership
if [ -f /.dockerenv ]; then
    echo "Running inside Docker, changing ownership..."
    chown -R node:node uploads
fi

echo "Creating required SSL directory structure..."
mkdir -p certbot/etc/letsencrypt/live/example.com
mkdir -p certbot/etc/letsencrypt/archive/example.com

echo "Creating placeholder SSL certificates (for testing only)..."
if [ ! -f certbot/etc/letsencrypt/live/example.com/fullchain.pem ]; then
    # Check if OpenSSL is installed
    if ! command -v openssl &> /dev/null; then
        echo "OpenSSL is not installed. Installing..."
        apt-get update && apt-get install -y openssl
    fi

    # Generate a self-signed certificate for local testing
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout certbot/etc/letsencrypt/live/example.com/privkey.pem \
        -out certbot/etc/letsencrypt/live/example.com/fullchain.pem \
        -subj "/CN=example.com" \
        -addext "subjectAltName = DNS:example.com"
    
    # Create dummy chain.pem
    cp certbot/etc/letsencrypt/live/example.com/fullchain.pem certbot/etc/letsencrypt/live/example.com/chain.pem
    
    # Link to archive (mimic certbot structure)
    ln -sf ../../archive/example.com/fullchain1.pem certbot/etc/letsencrypt/live/example.com/fullchain.pem
    ln -sf ../../archive/example.com/privkey1.pem certbot/etc/letsencrypt/live/example.com/privkey.pem
    ln -sf ../../archive/example.com/chain1.pem certbot/etc/letsencrypt/live/example.com/chain.pem
fi

echo "Permissions fixed successfully!" 