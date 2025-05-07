# Deployment Guide for Clinica Mullo

This guide will help you deploy your application to your server.

## Prerequisites

- Server with Docker and Docker Compose installed
- Domain (clinicamullo.com) pointing to your server IP (173.212.204.174)

## Deployment Steps

1. First, make sure all the files we've created are in your project:
   - docker-compose.prod.yml
   - .env.production
   - nginx/conf.d/default.conf.init
   - nginx/conf.d/default.conf.https
   - deploy-ssl.sh
   - nginx/www/502.html

2. Make the deployment script executable:
   ```bash
   chmod +x deploy-ssl.sh
   ```

3. Run the deployment script:
   ```bash
   ./deploy-ssl.sh
   ```

The script will:
- Create all necessary directories
- Deploy your application with HTTP first to get SSL certificates
- Configure HTTPS once certificates are obtained
- Restart Nginx to apply the HTTPS configuration

## Troubleshooting

If you encounter issues:

1. Check the container logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs
   ```

2. Check specific service logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs backend
   docker-compose -f docker-compose.prod.yml logs frontend
   docker-compose -f docker-compose.prod.yml logs nginx
   ```

3. If certbot fails, try running it manually:
   ```bash
   docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email admin@clinicamullo.com --agree-tos --no-eff-email -d clinicamullo.com -d www.clinicamullo.com --force-renewal
   ```

## Restarting Your Application

If you need to restart the application:

```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
``` 