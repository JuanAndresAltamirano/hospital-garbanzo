#!/bin/bash

# Exit on error
set -e

echo "===================================================="
echo "FIXING DATABASE CONNECTION FOR CLINICA MULLO"
echo "===================================================="

# Check if the database container is running
DB_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E 'db|mysql|clinica_mullo_db')
if [ -z "$DB_CONTAINER" ]; then
  echo "Database container not running. Looking for stopped containers..."
  STOPPED_DB=$(docker ps -a --format "{{.Names}}" | grep -E 'db|mysql|clinica_mullo_db')
  
  if [ -n "$STOPPED_DB" ]; then
    echo "Found stopped database container: $STOPPED_DB"
    echo "Starting it..."
    docker start $STOPPED_DB
    DB_CONTAINER=$STOPPED_DB
  else
    echo "No database container found. We need to start it."
    
    # Get the network
    NETWORK_NAME=$(docker network ls --format "{{.Name}}" | grep -E 'app-network|hospital' | head -1)
    if [ -z "$NETWORK_NAME" ]; then
      echo "Network not found. Creating hospital-garbanzo_app-network..."
      docker network create hospital-garbanzo_app-network
      NETWORK_NAME="hospital-garbanzo_app-network"
    fi
    
    # Read password from .env.production
    if [ -f ".env.production" ]; then
      ROOT_PASSWORD=$(grep MYSQL_ROOT_PASSWORD .env.production | cut -d= -f2)
      DB_NAME=$(grep MYSQL_DATABASE .env.production | cut -d= -f2)
    else
      echo "Creating default .env.production file..."
      cat > .env.production << EOL
# Database
MYSQL_ROOT_PASSWORD=clm_root_2024
MYSQL_DATABASE=clinica_mullo

# Domain
DOMAIN_NAME=clinicamullo.com
ADMIN_EMAIL=admin@clinicamullo.com

# Backend environment variables
NODE_ENV=production
DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=clm_root_2024
DB_DATABASE=clinica_mullo
JWT_SECRET=change_this_very_secret_key
JWT_EXPIRATION_TIME=86400

# Frontend environment variables
VITE_API_URL=https://clinicamullo.com/api
EOL
      ROOT_PASSWORD="clm_root_2024"
      DB_NAME="clinica_mullo"
      echo "Created .env.production with default values"
    fi
    
    # Start a database container
    echo "Starting MySQL database container..."
    docker run -d --name clinica_mullo_db \
      --network $NETWORK_NAME \
      -e MYSQL_ROOT_PASSWORD=$ROOT_PASSWORD \
      -e MYSQL_DATABASE=$DB_NAME \
      -v mysql_data:/var/lib/mysql \
      --restart always \
      mysql:8.0
    
    DB_CONTAINER="clinica_mullo_db"
    echo "Database container started as $DB_CONTAINER"
    
    # Wait for MySQL to initialize
    echo "Waiting for MySQL to initialize (30s)..."
    sleep 30
  fi
fi

echo "Using database container: $DB_CONTAINER"

# Get the current environment variables from backend container
BACKEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E 'backend|hospital-garbanzo_backend')
if [ -z "$BACKEND_CONTAINER" ]; then
  echo "Backend container not running. Cannot test database connection."
  exit 1
fi

echo "Backend container: $BACKEND_CONTAINER"

# Try connecting to MySQL from the backend container
echo "Testing MySQL connection from backend container..."
docker exec $BACKEND_CONTAINER bash -c "echo 'Attempting to connect to MySQL...'; \
  if command -v mysql > /dev/null; then \
    mysql -h db -u root -p\"\$DB_PASSWORD\" -e 'SHOW DATABASES;' || echo 'MySQL client not found'; \
  else \
    echo 'MySQL client not available in container'; \
  fi"

# Create a new .env file with the correct database credentials for the backend
echo "Updating backend environment variables..."
cat > .env.production.new << EOL
# Database
MYSQL_ROOT_PASSWORD=clm_root_2024
MYSQL_DATABASE=clinica_mullo

# Domain
DOMAIN_NAME=clinicamullo.com
ADMIN_EMAIL=admin@clinicamullo.com

# Backend environment variables
NODE_ENV=production
DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=clm_root_2024
DB_DATABASE=clinica_mullo
JWT_SECRET=change_this_very_secret_key
JWT_EXPIRATION_TIME=86400

# Frontend environment variables
VITE_API_URL=https://clinicamullo.com/api
EOL

# Backup existing file
if [ -f ".env.production" ]; then
  cp .env.production .env.production.bak
fi

# Update with new file
mv .env.production.new .env.production

# Create symbolic link for .env
ln -sf .env.production .env

# Stop and remove the backend container
echo "Recreating backend container with correct database credentials..."
docker stop $BACKEND_CONTAINER
docker rm $BACKEND_CONTAINER

# Get the network for backend connectivity
NETWORK_NAME=$(docker network ls --format "{{.Name}}" | grep -E 'app-network|hospital' | head -1)
if [ -z "$NETWORK_NAME" ]; then
  echo "Network not found. Creating hospital-garbanzo_app-network..."
  docker network create hospital-garbanzo_app-network
  NETWORK_NAME="hospital-garbanzo_app-network"
fi

# Check if backend source code exists
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
    -e DB_PASSWORD=clm_root_2024 \
    -e DB_DATABASE=clinica_mullo \
    -e JWT_SECRET=change_this_very_secret_key \
    -e JWT_EXPIRATION_TIME=86400 \
    -v $(pwd)/uploads:/app/uploads \
    --restart always \
    hospital-garbanzo_backend
  
  BACKEND_CONTAINER="hospital-garbanzo_backend"
  cd ..
else
  # Try to restart using the existing image
  echo "No backend source found. Trying to use existing image..."
  docker run -d --name hospital-garbanzo_backend \
    --network $NETWORK_NAME \
    -e NODE_ENV=production \
    -e DB_HOST=db \
    -e DB_PORT=3306 \
    -e DB_USERNAME=root \
    -e DB_PASSWORD=clm_root_2024 \
    -e DB_DATABASE=clinica_mullo \
    -e JWT_SECRET=change_this_very_secret_key \
    -e JWT_EXPIRATION_TIME=86400 \
    -v $(pwd)/uploads:/app/uploads \
    --restart always \
    hospital-garbanzo_backend:latest || echo "Failed to restart from existing image"
fi

# Wait for backend to start
echo "Waiting for backend to start (10s)..."
sleep 10

# Update Nginx configuration to use the new backend
echo "Updating Nginx configuration..."
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
        proxy_pass http://hospital-garbanzo_backend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
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
        proxy_pass http://hospital-garbanzo_backend:3000/uploads/;
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

# Check if the backend is working
echo "Checking backend logs..."
docker logs hospital-garbanzo_backend --tail 20

echo "===================================================="
echo "DATABASE CONNECTION FIX COMPLETE"
echo "The site and API should now be working at: https://clinicamullo.com"
echo ""
echo "If you're still having issues, try these commands:"
echo "docker logs hospital-garbanzo_backend" 
echo "docker logs clinica_mullo_db"
echo "docker logs nginx"
echo "=====================================================" 