#!/bin/bash

# Exit on error
set -e

echo "===================================================="
echo "FIXING NGINX CONFIGURATION FOR CLINICA MULLO"
echo "===================================================="

# Get the frontend container IP address
FRONTEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' frontend_simple)

if [ -z "$FRONTEND_IP" ]; then
  echo "Error: Could not find frontend_simple container. Make sure it's running."
  exit 1
fi

echo "Frontend container IP: $FRONTEND_IP"

# Create proper Nginx configuration
echo "Creating Nginx configuration..."
mkdir -p nginx/conf.d

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

# Reload Nginx configuration
echo "Reloading Nginx configuration..."
docker exec -it nginx nginx -s reload || {
  echo "Failed to reload Nginx. Let's restart the container..."
  docker restart nginx
}

echo "===================================================="
echo "NGINX CONFIGURATION UPDATED"
echo "Your site should now be accessible at: https://clinicamullo.com"
echo "====================================================" 