#!/bin/bash

# Stop the backend container
echo "Stopping backend container..."
docker stop $(docker ps | grep backend | awk '{print $1}')
docker rm $(docker ps -a | grep backend | awk '{print $1}')

# Rebuild the backend with correct password directly hardcoded
echo "Creating Dockerfile with the correct password..."
cat > backend-nest/Dockerfile.backend.direct.prod << EOF
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Directly modify the database configuration
RUN sed -i 's/configService.get('\''DB_HOST'\'') || '\''localhost'\''/'\''db'\''/g' src/app.module.ts
RUN sed -i 's/configService.get('\''DB_PORT'\'') ? +configService.get('\''DB_PORT'\'') : 3306/3306/g' src/app.module.ts
RUN sed -i 's/configService.get('\''DB_USERNAME'\'') || '\''root'\''/'\''root'\''/g' src/app.module.ts
RUN sed -i 's/configService.get('\''DB_PASSWORD'\'') || '\'''\''/'\''change_this_password'\''/g' src/app.module.ts
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

# Build the new backend container
echo "Building backend container with correct password..."
cd backend-nest
docker build -t backend-direct-fix -f Dockerfile.backend.direct.prod .
cd ..

# Start the new backend container
echo "Starting new backend container..."
docker run -d --name backend-direct-fix \
  --network hospital-garbanzo_app-network \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  --restart always \
  backend-direct-fix

# Update Nginx configuration
echo "Updating Nginx configuration..."
sed -i 's/clinica_mullo_backend/backend-direct-fix/g' nginx/conf.d/default.conf

# Apply Nginx configuration
echo "Applying Nginx configuration..."
docker cp nginx/conf.d/default.conf $(docker ps | grep nginx | awk '{print $1}'):/etc/nginx/conf.d/default.conf
docker exec $(docker ps | grep nginx | awk '{print $1}') nginx -s reload

echo "Database password fix complete!"
echo "Check the backend logs:"
echo "docker logs backend-direct-fix" 