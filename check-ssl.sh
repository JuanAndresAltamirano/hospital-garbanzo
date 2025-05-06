#!/bin/bash

# Check if domain name is provided
if [ -z "$1" ]; then
    # Try to read from .env.production
    if [ -f .env.production ]; then
        DOMAIN=$(grep "DOMAIN_NAME" .env.production | cut -d '=' -f2)
        if [ -z "$DOMAIN" ]; then
            echo "Error: No domain specified. Please provide a domain name as argument or set DOMAIN_NAME in .env.production"
            echo "Usage: $0 <domain_name>"
            exit 1
        fi
    else
        echo "Error: No domain specified and .env.production file not found."
        echo "Usage: $0 <domain_name>"
        exit 1
    fi
else
    DOMAIN=$1
fi

echo "Checking SSL certificate for domain: $DOMAIN"

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo "OpenSSL is not installed. Installing..."
    apt-get update && apt-get install -y openssl
fi

echo "=== Certificate Information ==="
echo | openssl s_client -showcerts -servername "$DOMAIN" -connect "$DOMAIN":443 2>/dev/null | openssl x509 -inform pem -noout -text | grep -E 'Subject:|Issuer:|Not Before:|Not After :|DNS:'

echo -e "\n=== Certificate Expiration ==="
EXPIRY_DATE=$(echo | openssl s_client -showcerts -servername "$DOMAIN" -connect "$DOMAIN":443 2>/dev/null | openssl x509 -inform pem -noout -enddate | cut -d= -f2)
EXPIRY_DATE_SECONDS=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_DATE_SECONDS=$(date +%s)
DAYS_LEFT=$(( (EXPIRY_DATE_SECONDS - CURRENT_DATE_SECONDS) / 86400 ))

echo "Certificate expires on: $EXPIRY_DATE ($DAYS_LEFT days remaining)"

if [ $DAYS_LEFT -lt 30 ]; then
    echo -e "\nWARNING: Certificate will expire in less than 30 days!"
    echo "You should renew your certificate. Run the following command to renew:"
    echo "docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --force-renewal --email \${ADMIN_EMAIL} --agree-tos --no-eff-email -d \${DOMAIN_NAME}"
fi

echo -e "\n=== SSL Configuration Test ==="
curl -s https://www.ssllabs.com/ssltest/analyze.html?d="$DOMAIN"&latest > /dev/null
echo "SSL Labs report will be available at: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"

echo -e "\nDone." 