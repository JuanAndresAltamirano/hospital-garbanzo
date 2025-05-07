#!/bin/bash

# Exit on error
set -e

echo "===================================================="
echo "DEBUGGING BACKEND CONNECTION FOR CLINICA MULLO"
echo "===================================================="

# List all running containers
echo "Currently running containers:"
docker ps

# Inspect networks
echo -e "\nDocker networks:"
docker network ls

# Check what network the nginx container is on
echo -e "\nNginx container networks:"
NGINX_NETWORKS=$(docker inspect nginx -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}')
echo "Nginx is on networks: $NGINX_NETWORKS"

# Get the network for backend connectivity
NETWORK_NAME=$(docker network ls --format "{{.Name}}" | grep app-network)
if [ -z "$NETWORK_NAME" ]; then
  echo "Could not find app-network. Using the same network as Nginx."
  NETWORK_NAME=$(echo $NGINX_NETWORKS | awk '{print $1}')
fi
echo "Using network: $NETWORK_NAME"

# List containers on the network
echo -e "\nContainers on $NETWORK_NAME network:"
docker network inspect $NETWORK_NAME -f '{{range .Containers}}{{.Name}} {{end}}'

# Check if backend is running
BACKEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E 'backend|hospital-garbanzo_backend')
if [ -z "$BACKEND_CONTAINER" ]; then
  echo -e "\nBackend container not running. Checking stopped containers..."
  STOPPED_BACKEND=$(docker ps -a --format "{{.Names}}" | grep -E 'backend|hospital-garbanzo_backend')
  
  if [ -n "$STOPPED_BACKEND" ]; then
    echo "Found stopped backend container: $STOPPED_BACKEND"
    echo "Starting it..."
    docker start $STOPPED_BACKEND
    BACKEND_CONTAINER=$STOPPED_BACKEND
  else
    echo "No backend container found at all. We need to rebuild it."
    
    # Build and start the backend container
    echo "Building and starting backend from source..."
    
    # Check if we have a backend-nest directory
    if [ -d "backend-nest" ]; then
      echo "Found backend-nest directory, building from it..."
      
      # Build and run backend
      cd backend-nest
      docker build -t hospital-garbanzo_backend -f Dockerfile.backend.prod .
      
      echo "Starting backend container..."
      docker run -d --name hospital-garbanzo_backend \
        --network $NETWORK_NAME \
        -e NODE_ENV=production \
        -e DB_HOST=db \
        -e DB_PORT=3306 \
        -e DB_USERNAME=root \
        -e DB_PASSWORD=$(grep MYSQL_ROOT_PASSWORD .env.production | cut -d= -f2) \
        -e DB_DATABASE=clinica_mullo \
        -e JWT_SECRET=change_this_very_secret_key \
        -e JWT_EXPIRATION_TIME=86400 \
        -v $(pwd)/uploads:/app/uploads \
        --restart always \
        hospital-garbanzo_backend
      
      BACKEND_CONTAINER="hospital-garbanzo_backend"
      cd ..
    else
      echo "Cannot find backend source code. Using a default backend container name."
      BACKEND_CONTAINER="backend"
    fi
  fi
fi

echo -e "\nUsing backend container: $BACKEND_CONTAINER"

# Make sure the backend container is on the same network as Nginx
echo "Ensuring backend is on the same network as Nginx..."
BACKEND_NETWORKS=$(docker inspect $BACKEND_CONTAINER -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>/dev/null || echo "")

if [[ ! "$BACKEND_NETWORKS" =~ "$NETWORK_NAME" ]]; then
  echo "Adding backend container to network $NETWORK_NAME..."
  docker network connect $NETWORK_NAME $BACKEND_CONTAINER || true
fi

# Get backend IP on the network
BACKEND_IP=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" $BACKEND_CONTAINER)
echo "Backend IP: $BACKEND_IP"

# Test direct connection to backend
echo -e "\nTesting direct connection to backend..."
docker exec nginx curl -v http://$BACKEND_CONTAINER:3000/ 2>&1 || echo "Failed to connect directly"

# Create improved Nginx config
echo -e "\nCreating improved Nginx configuration..."
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
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    
    # Increase client max body size for uploads
    client_max_body_size 50M;
    
    # Frontend
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
        
        # Debug info is saved to nginx logs
        add_header X-Debug-Backend "$BACKEND_CONTAINER:3000";
        
        # Add timeouts but with higher values
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
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

# Copy updated config to nginx container
echo "Copying configuration to Nginx container..."
docker cp nginx/conf.d/default.conf nginx:/etc/nginx/conf.d/default.conf

# Reload nginx config
echo "Reloading Nginx configuration..."
docker exec nginx nginx -s reload || {
  echo "Failed to reload Nginx. Restarting the container..."
  docker restart nginx
  sleep 5
}

# View backend logs
echo -e "\nBackend container logs (last 20 lines):"
docker logs $BACKEND_CONTAINER --tail 20 || echo "Could not get backend logs"

# View nginx logs
echo -e "\nNginx error logs (last 10 lines):"
docker exec nginx cat /var/log/nginx/error.log | tail -10 || echo "Could not get Nginx error logs"

echo -e "\nChecking if backend is listening on port 3000..."
docker exec $BACKEND_CONTAINER netstat -tuln | grep 3000 || echo "Port 3000 not detected in container"

echo "===================================================="
echo "BACKEND CONNECTION TROUBLESHOOTING COMPLETE"
echo "Manual verification steps:"
echo "1. Check if you can access the backend directly:"
echo "   curl http://$BACKEND_IP:3000/"
echo "2. Verify Nginx can connect to the backend:"
echo "   docker exec nginx curl -v http://$BACKEND_CONTAINER:3000/"
echo "3. Your API should now be accessible at: https://clinicamullo.com/api/"
echo "====================================================" 