#!/bin/bash

# Exit on error
set -e

echo "===================================================="
echo "FIXING CLINICA MULLO FRONTEND"
echo "===================================================="

# Create simplified nginx config
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

# Clean up containers
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

# Build and run
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

echo "===================================================="
echo "FRONTEND FIXED SUCCESSFULLY!"
echo ""
docker ps | grep frontend_simple
echo ""
echo "To check logs: docker logs frontend_simple"
echo "====================================================" 