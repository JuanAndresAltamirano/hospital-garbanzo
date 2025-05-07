#!/bin/bash

set -e

echo "===== SIMPLE HOSPITAL DEPLOYMENT ====="

# Clean up everything
echo "Cleaning up containers..."
docker stop $(docker ps -a -q) 2>/dev/null || true
docker rm $(docker ps -a -q) 2>/dev/null || true

echo "Cleaning up volumes..."
docker volume rm db_data 2>/dev/null || true

# Create necessary directories
echo "Creating directories..."
mkdir -p nginx
mkdir -p uploads
mkdir -p dist

# Build the frontend
echo "Building frontend..."
if [ -d "node_modules" ]; then
  npm run build
else
  echo "Installing dependencies and building..."
  npm install && npm run build
fi

# Copy frontend files to dist directory
echo "Ensuring dist directory exists..."
if [ ! -d "dist" ]; then
  echo "Error: dist directory not found"
  if [ -d "build" ]; then
    echo "Found 'build' directory, using it instead..."
    mkdir -p dist
    cp -r build/* dist/
  else
    echo "Creating a minimal index.html..."
    mkdir -p dist
    cat > dist/index.html << EOL
<!DOCTYPE html>
<html>
<head>
  <title>Clinica Mullo</title>
</head>
<body>
  <h1>Clinica Mullo</h1>
  <p>Frontend is working! API should be available at /api</p>
</body>
</html>
EOL
  fi
fi

# Create a simple database initialization script
echo "Setting up database scripts..."
mkdir -p mysql-init
cat > mysql-init/init.sql << EOL
CREATE DATABASE IF NOT EXISTS clinica_mullo;
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'password123';
FLUSH PRIVILEGES;
EOL

# Create simple docker-compose
echo "Creating simple docker-compose..."
cat > docker-compose.simple.yml << EOL
version: '3.8'

services:
  db:
    image: mysql:5.7
    container_name: clinica_mullo_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: password123
      MYSQL_DATABASE: clinica_mullo
      MYSQL_ROOT_HOST: '%'
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
      - ./mysql-init:/docker-entrypoint-initdb.d
    command: --default-authentication-plugin=mysql_native_password
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
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USERNAME=root
      - DB_PASSWORD=password123
      - DB_DATABASE=clinica_mullo
      - JWT_SECRET=SuperSecretKey123456789
      - JWT_EXPIRATION_TIME=86400
    volumes:
      - ./uploads:/app/uploads
    ports:
      - "3000:3000"
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: clinica_mullo_nginx
    ports:
      - "80:80"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
      - ./nginx/simple.conf:/etc/nginx/conf.d/default.conf
      - ./uploads:/usr/share/nginx/html/uploads
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  db_data:

networks:
  app-network:
    driver: bridge
EOL

# Create nginx config
echo "Creating nginx config..."
mkdir -p nginx
cat > nginx/simple.conf << EOL
server {
    listen 80;
    server_name clinicamullo.com www.clinicamullo.com;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Uploads
    location /uploads/ {
        alias /usr/share/nginx/html/uploads/;
        try_files \$uri =404;
    }
}
EOL

# Start the services
echo "Starting services with docker-compose..."
docker-compose -f docker-compose.simple.yml up -d

echo "Waiting for services to start up..."
sleep 10

# Check status
echo "Checking service status..."
docker-compose -f docker-compose.simple.yml ps

# Output success message
echo ""
echo "===== DEPLOYMENT COMPLETE ====="
echo "Your application should be accessible at:"
echo "http://clinicamullo.com/"
echo ""
echo "Check logs with:"
echo "docker logs clinica_mullo_nginx"
echo "docker logs clinica_mullo_backend"
echo "docker logs clinica_mullo_db"
echo ""
echo "===== TESTING CONNECTION ====="
echo "Testing database connection..."
docker exec clinica_mullo_db mysql -uroot -ppassword123 -e "SHOW DATABASES;" || echo "Database connection failed"
echo ""
echo "Testing backend API..."
curl -I http://localhost:3000/ || echo "Backend API connection failed"
echo "" 