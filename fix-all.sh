#!/bin/bash

# Exit on any error
set -e

echo "Starting complete fix for Clinica Mullo deployment..."

# Stop and remove all containers
echo "Cleaning up existing containers..."
docker stop $(docker ps -a -q) 2>/dev/null || true
docker rm $(docker ps -a -q) 2>/dev/null || true

# Remove all containers with specific names
echo "Removing specific containers if they exist..."
docker rm -f clinica_mullo_frontend clinica_mullo_backend clinica_mullo_db nginx 2>/dev/null || true

# Clean docker volumes to ensure fresh database state
echo "Cleaning docker volumes..."
docker volume rm mysql_data 2>/dev/null || true
docker volume create mysql_data

# Create required directories
echo "Creating required directories..."
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p nginx/www
mkdir -p certbot/etc/letsencrypt
mkdir -p certbot/var/www/certbot
mkdir -p uploads
mkdir -p database

# Create SSL params file if it doesn't exist
echo "Setting up SSL configuration..."
mkdir -p nginx/ssl
if [ ! -f nginx/ssl/ssl-params.conf ]; then
    cat > nginx/ssl/ssl-params.conf << EOL
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header X-Frame-Options SAMEORIGIN;
add_header X-Content-Type-Options nosniff;
EOL
    echo "Created SSL params configuration"
fi

# Update the nginx default.conf - SIMPLIFIED VERSION WITHOUT SSL
echo "Creating simplified Nginx configuration without SSL..."
cat > nginx/conf.d/default.conf << EOL
server {
    listen 80;
    server_name clinicamullo.com www.clinicamullo.com;
    
    # Increase client max body size for uploads
    client_max_body_size 50M;
    
    # Frontend - direct to static files first
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Add longer timeouts
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'X-Requested-With, Content-Type, Authorization' always;
        
        # Handle OPTIONS method for CORS preflight
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
            add_header 'Access-Control-Allow-Headers' 'X-Requested-With, Content-Type, Authorization';
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
    
    # Uploads
    location /uploads/ {
        proxy_pass http://backend:3000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOL

# Create a fixed docker-compose file
echo "Creating fixed docker-compose file..."
cat > docker-compose.fixed.yml << EOL
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: clinica_mullo_db
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_ROOT_PASSWORD: password123
      MYSQL_DATABASE: clinica_mullo
      MYSQL_USER: dbuser
      MYSQL_PASSWORD: password123
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database:/docker-entrypoint-initdb.d
    restart: always
    networks:
      - app-network

  backend:
    build:
      context: ./backend-nest
      dockerfile: Dockerfile.backend.prod
    container_name: clinica_mullo_backend
    restart: always
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USERNAME=root
      - DB_PASSWORD=password123
      - DB_DATABASE=clinica_mullo
      - JWT_SECRET=SuperSecretKey123456789
      - JWT_EXPIRATION_TIME=86400
    networks:
      - app-network
    ports:
      - "3000:3000"

  frontend:
    container_name: clinica_mullo_frontend
    build:
      context: .
      dockerfile: Dockerfile.frontend.prod
    restart: always
    networks:
      - app-network

  nginx:
    image: nginx:stable
    container_name: clinica_mullo_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/www:/var/www/html
      - ./uploads:/usr/share/nginx/html/uploads
    depends_on:
      - frontend
      - backend
    restart: always
    networks:
      - app-network

volumes:
  mysql_data:
    external: false

networks:
  app-network:
    driver: bridge
EOL

# Create a database initialization script for test data
echo "Creating database initialization script..."
mkdir -p database
cat > database/01-init.sql << EOL
-- Create a simple test table
CREATE TABLE IF NOT EXISTS test (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some test data
INSERT INTO test (name) VALUES ('Test 1');
INSERT INTO test (name) VALUES ('Test 2');
EOL

# Create the permissions script to ensure root access from any host
cat > database/00-setup-permissions.sql << EOL
-- Grant privileges to root user from any host
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Create application user
CREATE USER IF NOT EXISTS 'dbuser'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON clinica_mullo.* TO 'dbuser'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;
EOL

# First, start just the database to ensure it initializes properly
echo "Starting database container first..."
docker-compose -f docker-compose.fixed.yml up -d db
echo "Waiting for database to initialize (30 seconds)..."
sleep 30

# Deploy the rest of the services
echo "Starting remaining services..."
docker-compose -f docker-compose.fixed.yml up -d

echo "Deployment complete! Waiting for services to start..."
sleep 10

echo "Checking service status..."
docker-compose -f docker-compose.fixed.yml ps

# Verify database connection
echo "Verifying database connection..."
docker exec clinica_mullo_db mysql -uroot -ppassword123 -e "SHOW DATABASES;"

# Check backend logs to verify database connection
echo "Checking backend logs..."
docker logs clinica_mullo_backend

# Modify frontend container to use correct nginx config
echo "Creating simple Nginx config for frontend container..."
docker exec clinica_mullo_frontend sh -c 'cat > /etc/nginx/conf.d/default.conf << EOF
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF'

# Restart frontend to apply new config
echo "Restarting frontend container..."
docker restart clinica_mullo_frontend

# Display access information
echo ""
echo "=============================="
echo "Deployment Summary:"
echo "=============================="
echo "IP Address: 173.212.204.174"
echo "Domain: clinicamullo.com"
echo ""
echo "To check container logs, run:"
echo "docker logs clinica_mullo_frontend"
echo "docker logs clinica_mullo_backend"
echo "docker logs clinica_mullo_db"
echo "docker logs clinica_mullo_nginx"
echo ""
echo "To check all containers:"
echo "docker ps -a"
echo "==============================" 