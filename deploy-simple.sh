#!/bin/bash

# Exit on any error
set -e

echo "===================================================="
echo "Simple deployment script for Clinica Mullo"
echo "===================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running or not accessible. Please start Docker."
  exit 1
fi

# Get the correct network name
NETWORK_NAME=$(docker network ls --format "{{.Name}}" | grep app-network)
if [ -z "$NETWORK_NAME" ]; then
  echo "Creating app network..."
  docker network create hospital-garbanzo_app-network
  NETWORK_NAME="hospital-garbanzo_app-network"
fi

echo "Using network: $NETWORK_NAME"

# Force remove existing containers with these names
CONTAINERS=(
  "clinica_mullo_frontend"
  "hospital-garbanzo_frontend_1"
  "f25d7e11465" # ID from error message
)

for container in "${CONTAINERS[@]}"; do
  if docker ps -a | grep -q "$container"; then
    echo "Force removing container: $container"
    docker rm -f "$container" || true
  fi
done

# Remove any existing frontend image
echo "Removing existing frontend images..."
docker rmi clinica_mullo_frontend || true
docker rmi hospital-garbanzo_frontend || true

# Build the frontend
echo "Building frontend with Node 18..."
docker build -t clinica_mullo_frontend:latest -f Dockerfile.frontend.prod .

# Run the frontend container with a random name
echo "Running frontend container..."
docker run -d --name clinica_mullo_frontend_$(date +%s) \
  --network "$NETWORK_NAME" \
  --restart always \
  clinica_mullo_frontend:latest

echo "===================================================="
echo "Frontend deployed successfully"
echo "Check status with: docker ps"
echo "====================================================" 