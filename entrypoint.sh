#!/bin/sh

# Use PORT environment variable if provided, otherwise default to 80
PORT=${PORT:-80}

echo "Starting nginx on port ${PORT}..."

# Replace the port in nginx.conf
sed -i "s/listen 80;/listen ${PORT};/g" /etc/nginx/conf.d/default.conf

# Verify nginx configuration
echo "Verifying nginx configuration..."
nginx -t

# Check if dist files exist
echo "Checking if build files exist..."
ls -la /usr/share/nginx/html/ || echo "WARNING: Build files not found!"

# Start nginx
echo "Starting nginx..."
exec nginx -g 'daemon off;'

