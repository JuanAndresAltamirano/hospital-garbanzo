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
    echo "Warning: .env.production file not found, creating a default one."
    echo "You should update this file with your actual values before deploying to production."
    
    cat > .env.production << EOL
# Database
MYSQL_ROOT_PASSWORD=change_this_password
MYSQL_DATABASE=clinica_mullo

# Domain
DOMAIN_NAME=example.com
ADMIN_EMAIL=admin@example.com

# Backend environment variables
NODE_ENV=production
DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=change_this_password
DB_DATABASE=clinica_mullo
JWT_SECRET=change_this_very_secret_key
JWT_EXPIRATION_TIME=86400

# Frontend environment variables
VITE_API_URL=https://example.com/api
EOL
    
    echo "Default .env.production file created. Please edit it with your actual values."
    echo "Press Enter to continue or Ctrl+C to abort and edit the file manually."
    read -r
fi

# Create symbolic link for .env
ln -sf .env.production .env

# Check Docker version
echo "Checking Docker version..."
docker --version

# Check docker-compose
echo "Checking if docker-compose is installed..."
if command -v docker-compose &> /dev/null; then
    echo "Using standalone docker-compose command"
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    echo "Using integrated docker compose command"
    COMPOSE_CMD="docker compose"
else
    echo "Neither docker-compose nor docker compose is available"
    # Install Docker Compose if not available
    echo "Installing docker-compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    COMPOSE_CMD="docker-compose"
fi

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
fi

echo "Stopping any existing services..."
$COMPOSE_CMD -f docker-compose.prod.yml down || true

echo "Starting the build process (this may take some time)..."
$COMPOSE_CMD -f docker-compose.prod.yml build --no-cache

echo "Starting the services..."
$COMPOSE_CMD -f docker-compose.prod.yml up -d

echo "Waiting for services to start..."
sleep 10

# Check if services are running properly
echo "Checking service status..."
$COMPOSE_CMD -f docker-compose.prod.yml ps

# Check logs of any failed services
echo "Checking logs of backend service..."
$COMPOSE_CMD -f docker-compose.prod.yml logs backend

echo "Checking logs of frontend service..."
$COMPOSE_CMD -f docker-compose.prod.yml logs frontend

# Check if nginx is running
if docker ps | grep -q nginx; then
    echo "Nginx is running properly."
else
    echo "Error: Nginx is not running!"
    echo "Check logs for more details:"
    $COMPOSE_CMD -f docker-compose.prod.yml logs nginx
    exit 1
fi

echo "Deployment completed successfully!"
echo "Your website should now be accessible at your domain."
echo ""
echo "To check the status of the services, run:"
echo "$COMPOSE_CMD -f docker-compose.prod.yml ps"
echo ""
echo "To view logs, run:"
echo "$COMPOSE_CMD -f docker-compose.prod.yml logs -f [service_name]"
echo ""
echo "To stop the services, run:"
echo "$COMPOSE_CMD -f docker-compose.prod.yml down" 