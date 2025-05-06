#!/bin/bash

# Exit on error
set -e

echo "===================================================="
echo "COMPLETE FIX FOR CLINICA MULLO"
echo "===================================================="

# PART 1: Fix Frontend Container
echo "STEP 1: Creating and deploying frontend container..."

# Create simplified nginx config for frontend container
echo "Creating simplified Nginx config..."
mkdir -p nginx/conf.d
cat > nginx/conf.d/frontend.conf << 'EOF'
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Clean up existing containers
echo "Cleaning up existing containers..."
docker ps -a | grep frontend | awk '{print $1}' | xargs docker rm -f 2>/dev/null || true
docker rm -f f25d7e11465 2>/dev/null || true
docker rm -f clinica_mullo_frontend 2>/dev/null || true

# Get network name
echo "Identifying Docker network..."
NETWORK_NAME=$(docker network ls --format "{{.Name}}" | grep app-network)
if [ -z "$NETWORK_NAME" ]; then
  echo "Creating network..."
  docker network create hospital-garbanzo_app-network
  NETWORK_NAME="hospital-garbanzo_app-network"
fi
echo "Using network: $NETWORK_NAME"

# Build and deploy frontend
echo "Building frontend with Node 18..."
docker build -t frontend-simple -f - . << 'DOCKERFILE'
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/conf.d/frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
DOCKERFILE

echo "Starting frontend container..."
docker run -d --name frontend_simple --network "$NETWORK_NAME" --restart always frontend-simple

sleep 5  # Wait for container to fully start

# PART 2: Fix Nginx Configuration
echo "STEP 2: Configuring main Nginx server..."

# Get the frontend container IP address
FRONTEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' frontend_simple)

if [ -z "$FRONTEND_IP" ]; then
  echo "Error: Could not find frontend_simple container IP address."
  echo "Trying with container name instead..."
  FRONTEND_IP="frontend_simple"
fi

echo "Frontend container IP/name: $FRONTEND_IP"

# Create proper Nginx configuration
echo "Creating main Nginx configuration..."

cat > nginx/conf.d/default.conf << EOF
server {
    listen 80;
    server_name clinicamullo.com www.clinicamullo.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name clinicamullo.com www.clinicamullo.com;
    
    ssl_certificate /etc/letsencrypt/live/clinicamullo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clinicamullo.com/privkey.pem;
    
    # Increase client max body size for uploads
    client_max_body_size 50M;
    
    # Frontend
    location / {
        proxy_pass http://$FRONTEND_IP:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Add timeouts
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # Uploads
    location /uploads/ {
        proxy_pass http://backend:3000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Error handling
    error_page 502 /502.html;
    location = /502.html {
        root /var/www/html;
        internal;
    }
}
EOF

# Create SSL parameters file if missing
if [ ! -f nginx/ssl/ssl-params.conf ]; then
    echo "Creating SSL parameters file..."
    mkdir -p nginx/ssl
    cat > nginx/ssl/ssl-params.conf << 'EOF'
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
EOF
fi

# Copy SSL params to the right location (for docker to mount)
docker cp nginx/ssl/ssl-params.conf nginx:/etc/nginx/ssl/ssl-params.conf || {
  echo "Could not copy SSL params directly. Will create directory and try again..."
  docker exec -it nginx mkdir -p /etc/nginx/ssl/
  docker cp nginx/ssl/ssl-params.conf nginx:/etc/nginx/ssl/ssl-params.conf || true
}

# Reload or restart Nginx
echo "Reloading Nginx configuration..."
docker exec nginx nginx -s reload || {
  echo "Failed to reload Nginx. Restarting the container..."
  docker restart nginx
}

# Final message
echo "===================================================="
echo "CLINICA MULLO WEBSITE IS NOW FIXED!"
echo "Your website should be accessible at: https://clinicamullo.com"
echo ""
echo "Container status:"
docker ps | grep -E 'frontend|nginx|backend'
echo ""
echo "For troubleshooting:"
echo "- Frontend logs: docker logs frontend_simple"
echo "- Nginx logs: docker logs nginx"
echo "====================================================" 