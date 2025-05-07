#!/bin/bash

# Copy the updated Nginx configuration to the container
docker cp nginx/conf.d/default.conf clinica_mullo_nginx:/etc/nginx/conf.d/default.conf || docker cp nginx/conf.d/default.conf 0bcd101ab043:/etc/nginx/conf.d/default.conf

# Test the configuration
docker exec clinica_mullo_nginx nginx -t || docker exec 0bcd101ab043 nginx -t

# Reload Nginx
docker exec clinica_mullo_nginx nginx -s reload || docker exec 0bcd101ab043 nginx -s reload

echo "Nginx configuration reloaded. The website should now be accessible at http://clinicamullo.com" 