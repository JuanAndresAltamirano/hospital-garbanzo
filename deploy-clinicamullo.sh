#!/bin/bash

# Exit on any error
set -e

# Set environment variables
export DOMAIN_NAME=clinicamullo.com
export SERVER_IP=173.212.204.174

echo "========================================="
echo "Deploying Clinica Mullo to $DOMAIN_NAME"
echo "Server IP: $SERVER_IP"
echo "========================================="

# Create required directories
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p nginx/www
mkdir -p certbot/etc/letsencrypt
mkdir -p certbot/var/www/certbot
mkdir -p uploads
mkdir -p database

# Create SSL parameters file if it doesn't exist
if [ ! -f nginx/ssl/ssl-params.conf ]; then
    echo "Creating SSL parameters file..."
    cat > nginx/ssl/ssl-params.conf << 'EOL'
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Add headers to enhance security
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
EOL
fi

# Update the production environment variables
echo "Setting up environment variables..."
cat > .env.production << EOL
# Database
MYSQL_ROOT_PASSWORD=change_this_password
MYSQL_DATABASE=clinica_mullo

# Domain
DOMAIN_NAME=clinicamullo.com
ADMIN_EMAIL=admin@clinicamullo.com

# Backend environment variables
NODE_ENV=production
DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=change_this_password
DB_DATABASE=clinica_mullo
JWT_SECRET=change_this_very_secret_key
JWT_EXPIRATION_TIME=86400

# Frontend environment variables
VITE_API_URL=https://clinicamullo.com/api
EOL

echo "Please review and update passwords in .env.production file!"
echo "Press Enter to continue or Ctrl+C to abort and edit the file manually."
read -r

# Create symbolic link for .env
ln -sf .env.production .env

# Determine docker-compose command
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "Neither docker-compose nor docker compose is available. Installing..."
    apt-get update && apt-get install -y docker-compose
    COMPOSE_CMD="docker-compose"
fi

# Clean up existing deployment
echo "Stopping any existing services..."
$COMPOSE_CMD -f docker-compose.prod.yml down || true

# Check for conflicting containers
if docker ps -a --format '{{.Names}}' | grep -q "clinica_mullo_db"; then
    echo "Removing conflicting database container..."
    docker rm -f clinica_mullo_db
fi

# Update nginx config file for domain
echo "Configuring Nginx for $DOMAIN_NAME..."
cat > nginx/conf.d/default.conf << EOL
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

# This is a temporary server block to get SSL certificates
# It will be replaced after certificates are obtained
server {
    listen 443 ssl;
    server_name clinicamullo.com www.clinicamullo.com;
    
    # Using self-signed certificates initially
    ssl_certificate /etc/nginx/ssl/self-signed.crt;
    ssl_certificate_key /etc/nginx/ssl/self-signed.key;
    
    # Include SSL configuration
    include /etc/nginx/ssl/ssl-params.conf;
    
    location / {
        return 444;
    }
}
EOL

# Generate self-signed certificates for initial setup
echo "Generating temporary self-signed certificates..."
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/self-signed.key \
    -out nginx/ssl/self-signed.crt \
    -subj "/CN=clinicamullo.com" \
    -addext "subjectAltName=DNS:clinicamullo.com,DNS:www.clinicamullo.com"

# Build and start just the Nginx container first for SSL setup
echo "Starting Nginx for SSL certificate acquisition..."
$COMPOSE_CMD -f docker-compose.prod.yml up -d nginx

# Allow nginx to start
echo "Waiting for Nginx to start..."
sleep 5

# Run certbot to get SSL certificates
echo "Obtaining SSL certificates..."
$COMPOSE_CMD -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email admin@clinicamullo.com --agree-tos --no-eff-email \
    --force-renewal \
    -d clinicamullo.com -d www.clinicamullo.com

# Update Nginx config with real SSL certificates
echo "Updating Nginx configuration with SSL certificates..."
cat > nginx/conf.d/default.conf << EOL
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
    
    # Include SSL configuration
    include /etc/nginx/ssl/ssl-params.conf;
    
    # Increase client max body size for uploads
    client_max_body_size 50M;
    
    # Frontend
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
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
EOL

# Reload Nginx to apply the new configuration
echo "Reloading Nginx configuration..."
docker exec nginx nginx -s reload

# Build and deploy all services
echo "Building and deploying all services..."
$COMPOSE_CMD -f docker-compose.prod.yml up -d --build

echo "Waiting for services to start..."
sleep 10

# Create a renewal hook for certbot to reload nginx after certificate renewal
echo "Setting up certificate renewal..."
mkdir -p certbot/etc/letsencrypt/renewal-hooks/post
cat > certbot/etc/letsencrypt/renewal-hooks/post/reload-nginx.sh << 'EOL'
#!/bin/bash
docker exec nginx nginx -s reload
EOL
chmod +x certbot/etc/letsencrypt/renewal-hooks/post/reload-nginx.sh

# Set up automatic renewal with a cron job
echo "Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null || echo "") | grep -v "certbot renew" | { cat; echo "0 12 * * * docker-compose -f /home/juan/stuff/new-hospital/docker-compose.prod.yml run --rm certbot renew"; } | crontab -

# Check if services are running properly
echo "Checking service status..."
$COMPOSE_CMD -f docker-compose.prod.yml ps

echo "========================================="
echo "Deployment completed!"
echo "Your website should now be accessible at: https://clinicamullo.com"
echo ""
echo "To check the status of services:"
echo "$COMPOSE_CMD -f docker-compose.prod.yml ps"
echo ""
echo "To view logs:"
echo "$COMPOSE_CMD -f docker-compose.prod.yml logs -f [service_name]"
echo ""
echo "To stop services:"
echo "$COMPOSE_CMD -f docker-compose.prod.yml down"
echo "==========================================" 