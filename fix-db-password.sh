#!/bin/bash

# Get the current database password from the running container
echo "Looking for the existing database container environment variables..."
DB_CONTAINER_ID=$(docker ps | grep mysql | awk '{print $1}')
if [ -z "$DB_CONTAINER_ID" ]; then
  echo "MySQL container not found!"
  exit 1
fi

# Get environment variables from the container
echo "Getting environment variables from the MySQL container..."
ENV_VARS=$(docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' $DB_CONTAINER_ID)
MYSQL_ROOT_PASSWORD=$(echo "$ENV_VARS" | grep MYSQL_ROOT_PASSWORD | cut -d= -f2)

if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
  echo "Could not find MYSQL_ROOT_PASSWORD in container environment!"
  exit 1
fi

echo "Found database password: $MYSQL_ROOT_PASSWORD"

# Update the backend container environment variables
echo "Updating backend container with the correct database password..."
BACKEND_CONTAINER_ID=$(docker ps | grep backend | awk '{print $1}')
if [ -z "$BACKEND_CONTAINER_ID" ]; then
  echo "Backend container not found!"
  exit 1
fi

# Stop the backend container
echo "Stopping backend container..."
docker stop $BACKEND_CONTAINER_ID

# Create a revised fixed Dockerfile for the backend
cat > backend-nest/Dockerfile.backend.fixed.prod << EOF
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Directly modify the database configuration with the correct password
RUN sed -i 's/configService.get('\''DB_HOST'\'') || '\''localhost'\''/'\''db'\''/g' src/app.module.ts
RUN sed -i 's/configService.get('\''DB_PORT'\'') ? +configService.get('\''DB_PORT'\'') : 3306/3306/g' src/app.module.ts
RUN sed -i 's/configService.get('\''DB_USERNAME'\'') || '\''root'\''/'\''root'\''/g' src/app.module.ts
RUN sed -i 's/configService.get('\''DB_PASSWORD'\'') || '\'''\''/'\''$MYSQL_ROOT_PASSWORD'\''/g' src/app.module.ts
RUN sed -i 's/configService.get('\''DB_DATABASE'\'') || '\''hospital'\''/'\''clinica_mullo'\''/g' src/app.module.ts

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
EOF

# Rebuild the backend container
echo "Rebuilding and starting backend container with correct password..."
cd backend-nest
docker build -t backend-fixed -f Dockerfile.backend.fixed.prod .
cd ..

# Start the new backend container
docker run -d --name backend-fixed \
  --network hospital-garbanzo_app-network \
  -p 3000:3000 \
  --restart always \
  backend-fixed

# Update Nginx configuration to point to the new backend container
echo "Updating Nginx configuration to point to the new backend container..."
sed -i 's/clinica_mullo_backend/backend-fixed/g' nginx/conf.d/default.conf

# Apply Nginx configuration changes
docker cp nginx/conf.d/default.conf $(docker ps | grep nginx | awk '{print $1}'):/etc/nginx/conf.d/default.conf
docker exec $(docker ps | grep nginx | awk '{print $1}') nginx -s reload

echo "Database password fix complete. The backend should now be able to connect to the database."
echo "Check the logs of the new backend container:"
echo "docker logs backend-fixed" 