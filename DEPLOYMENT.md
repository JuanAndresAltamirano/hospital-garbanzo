# Deployment Guide for Contabo VPS

This guide explains how to deploy this website to a Contabo VPS.

## Prerequisites

- A Contabo VPS with SSH access
- A domain name pointing to your VPS IP address
- Basic knowledge of Linux commands

## Deployment Steps

1. **Clone the repository to your VPS**

   ```bash
   git clone <your-repository-url> /path/to/your/app
   cd /path/to/your/app
   ```

2. **Configure environment variables**

   Edit the `.env.production` file and update it with your specific configuration:
   
   ```bash
   nano .env.production
   ```
   
   Make sure to update:
   - Database credentials
   - Domain name
   - Admin email
   - JWT secret

3. **Run the deployment script**

   ```bash
   sudo ./deploy.sh
   ```

   This script will:
   - Create necessary directories
   - Install Docker and Docker Compose if not already installed
   - Start all the services defined in docker-compose.prod.yml
   - Check if Nginx is running properly

4. **SSL Certificate Setup**

   The deployment includes automatic SSL certificate generation with Certbot. If you encounter any issues, you can manually request certificates:

   ```bash
   docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email your@email.com --agree-tos --no-eff-email -d yourdomain.com
   ```

5. **Verify Deployment**

   Visit your domain in a web browser to verify that your website is deployed correctly.

## Maintenance

### Checking Service Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Viewing Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Restarting Services

```bash
docker-compose -f docker-compose.prod.yml restart
```

### Stopping Services

```bash
docker-compose -f docker-compose.prod.yml down
```

### Updating the Application

To update your application after making changes:

1. Pull the latest changes from your repository:
   ```bash
   git pull
   ```

2. Rebuild and restart the services:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## Backup Strategy

### Database Backup

To backup the MySQL database:

```bash
docker exec clinica_mullo_db mysqldump -u root -p<your-password> clinica_mullo > backup_$(date +%Y%m%d).sql
```

### Restoring a Backup

```bash
cat backup_file.sql | docker exec -i clinica_mullo_db mysql -u root -p<your-password> clinica_mullo
```

## Troubleshooting

- **Nginx not starting**: Check Nginx configuration using `docker-compose -f docker-compose.prod.yml logs nginx`
- **Database connection issues**: Verify the database credentials in `.env.production`
- **SSL certificate problems**: Check Certbot logs with `docker-compose -f docker-compose.prod.yml logs certbot` 