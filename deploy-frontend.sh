#!/bin/bash

# Exit on any error
set -e

echo "===================================================="
echo "Frontend deployment script for Clinica Mullo"
echo "===================================================="

# Create required SSL directory and file
echo "Creating SSL parameters file..."
mkdir -p nginx/ssl
cat > nginx/ssl/ssl-params.conf << 'EOL'
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Add headers to enhance security
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
EOL

# Check if nginx config directory exists
mkdir -p nginx/conf.d

# Check if default.conf exists, if not, create a simplified version without SSL
if [ ! -f nginx/conf.d/default.conf ]; then
  echo "Creating simplified Nginx configuration..."
  cat > nginx/conf.d/default.conf << 'EOL'
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
EOL
fi

# Get the correct network name
NETWORK_NAME=$(docker network ls --format "{{.Name}}" | grep app-network)
if [ -z "$NETWORK_NAME" ]; then
  echo "Creating app network..."
  docker network create hospital-garbanzo_app-network
  NETWORK_NAME="hospital-garbanzo_app-network"
fi

echo "Using network: $NETWORK_NAME"

# Force remove existing containers with these names
CONTAINERS=(
  "clinica_mullo_frontend"
  "hospital-garbanzo_frontend_1"
  "f25d7e11465" # ID from error message
)

for container in "${CONTAINERS[@]}"; do
  if docker ps -a | grep -q "$container"; then
    echo "Force removing container: $container"
    docker rm -f "$container" || true
  fi
done

# Remove any existing frontend image
echo "Removing existing frontend images..."
docker rmi clinica_mullo_frontend:latest || true
docker rmi hospital-garbanzo_frontend || true

# Build the frontend
echo "Building frontend with Node 18..."
docker build -t clinica_mullo_frontend:latest -f Dockerfile.frontend.prod .

# Run the frontend container with a unique name
UNIQUE_NAME="clinica_mullo_frontend_$(date +%s)"
echo "Running frontend container as: $UNIQUE_NAME"
docker run -d --name "$UNIQUE_NAME" \
  --network "$NETWORK_NAME" \
  --restart always \
  clinica_mullo_frontend:latest

echo "===================================================="
echo "Frontend deployed successfully"
echo "Container name: $UNIQUE_NAME"
echo "Check status with: docker ps"
echo "View logs with: docker logs $UNIQUE_NAME"
echo "=====================================================" 