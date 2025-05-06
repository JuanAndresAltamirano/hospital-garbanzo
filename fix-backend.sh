#!/bin/bash

# Exit on error
set -e

echo "===================================================="
echo "FIXING BACKEND API FOR CLINICA MULLO"
echo "===================================================="

# Check if backend container is running
BACKEND_RUNNING=$(docker ps | grep -E 'backend' | wc -l)
if [ "$BACKEND_RUNNING" -eq 0 ]; then
  echo "Backend container is not running. Will need to start it."
  
  # Get network name
  NETWORK_NAME=$(docker network ls --format "{{.Name}}" | grep app-network)
  if [ -z "$NETWORK_NAME" ]; then
    echo "Creating network..."
    docker network create hospital-garbanzo_app-network
    NETWORK_NAME="hospital-garbanzo_app-network"
  fi
  
  echo "Starting backend container..."
  # Try to start the existing backend container if it exists
  if docker ps -a | grep -q "backend"; then
    echo "Found existing backend container, starting it..."
    docker start $(docker ps -a | grep backend | awk '{print $1}')
  else
    echo "No existing backend container found. Check if it's running with a different name."
    docker ps -a | grep -E 'backend|nest|node'
  fi
else
  echo "Backend container is running."
fi

# Check actual backend container name
BACKEND_CONTAINER=$(docker ps | grep -E 'backend|hospital-garbanzo_backend' | awk '{print $NF}' | head -n 1)
if [ -z "$BACKEND_CONTAINER" ]; then
  echo "Could not find running backend container. Using 'backend' as default."
  BACKEND_CONTAINER="backend"
else
  echo "Found backend container: $BACKEND_CONTAINER"
fi

# Update Nginx config to use correct backend name
echo "Updating Nginx configuration to use correct backend name..."
cat > nginx/conf.d/default.conf.new << EOF
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
    
    # Frontend - get frontend container IP
    location / {
        proxy_pass http://frontend_simple:80;
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
        proxy_pass http://$BACKEND_CONTAINER:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Add timeouts and debug info
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_buffering off;
        
        # Add CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'X-Requested-With,Content-Type,Authorization' always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
    
    # Uploads
    location /uploads/ {
        proxy_pass http://$BACKEND_CONTAINER:3000/uploads/;
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

# Make a backup of the current config
cp nginx/conf.d/default.conf nginx/conf.d/default.conf.bak || true

# Replace with new config
mv nginx/conf.d/default.conf.new nginx/conf.d/default.conf

# Copy updated config to nginx container
docker cp nginx/conf.d/default.conf nginx:/etc/nginx/conf.d/default.conf

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

    # Copy SSL params to the right location
    docker cp nginx/ssl/ssl-params.conf nginx:/etc/nginx/ssl/ssl-params.conf || {
      echo "Could not copy SSL params directly. Creating directory..."
      docker exec nginx mkdir -p /etc/nginx/ssl/
      docker cp nginx/ssl/ssl-params.conf nginx:/etc/nginx/ssl/ssl-params.conf || true
    }
fi

# Reload nginx config
echo "Reloading Nginx configuration..."
docker exec nginx nginx -s reload || {
  echo "Failed to reload Nginx. Restarting the container..."
  docker restart nginx
}

# Check backend logs
echo "Checking backend logs for troubleshooting..."
docker logs "$BACKEND_CONTAINER" | tail -n 20

# Test backend connectivity
echo "Testing backend API connectivity..."
curl -k -v https://localhost/api/ 2>&1 | grep -A 10 "< HTTP"

echo "===================================================="
echo "BACKEND API FIX COMPLETED"
echo "Your API should now be accessible at: https://clinicamullo.com/api/"
echo ""
echo "If you still have issues, check logs with:"
echo "docker logs $BACKEND_CONTAINER"
echo "docker logs nginx"
echo "=====================================================" 