#!/bin/bash

# Exit on error
set -e

# Print instructions
echo "===== ONE-LINE FIX FOR FRONTEND ====="
echo ""
echo "To fix your frontend, SSH into your server and run this command:"
echo ""
echo "curl -s https://raw.githubusercontent.com/gist/anonymous/1234567890/raw/fix-frontend.sh | bash"
echo ""
echo "Or you can also copy and paste this entire command:"
echo ""
cat << 'COMMAND'
bash -c "$(cat << 'EOL'
#!/bin/bash
set -e
echo "==== FIXING FRONTEND ===="

# Create simplified nginx config
mkdir -p nginx/conf.d
cat > nginx/conf.d/frontend.conf << 'EOF'
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Clean up containers
docker ps -a | grep frontend | awk '{print \$1}' | xargs docker rm -f 2>/dev/null || true
docker rm -f f25d7e11465 2>/dev/null || true
docker rm -f clinica_mullo_frontend 2>/dev/null || true

# Get network name
NETWORK_NAME=\$(docker network ls --format "{{.Name}}" | grep app-network)
if [ -z "\$NETWORK_NAME" ]; then
  docker network create hospital-garbanzo_app-network
  NETWORK_NAME="hospital-garbanzo_app-network"
fi

# Build and run
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

docker run -d --name frontend_simple --network "\$NETWORK_NAME" --restart always frontend-simple
echo "=== FRONTEND FIXED! ==="
docker ps | grep frontend_simple
EOL
)"
COMMAND 