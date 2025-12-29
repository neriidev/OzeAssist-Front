#!/bin/sh
set -e

# Use PORT environment variable if provided, otherwise default to 80
PORT=${PORT:-80}

echo "=========================================="
echo "Configuring nginx for Railway deployment"
echo "=========================================="
echo "Port: ${PORT}"

# A configuração principal do nginx já está limitada a 1 worker via nginx-main.conf
echo "Nginx configured with 1 worker process (memory optimized)"

# Replace the port in server config
echo "Updating server port configuration..."
sed -i "s/listen 80;/listen ${PORT};/g" /etc/nginx/conf.d/default.conf

# Configurar URL do backend (rede privada do Railway ou variável de ambiente)
BACKEND_URL=${BACKEND_INTERNAL_URL:-"http://backend.railway.internal"}
echo "Backend URL: ${BACKEND_URL}"
echo "Updating backend proxy configuration..."
sed -i "s|BACKEND_INTERNAL_URL_PLACEHOLDER|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

# Verify nginx configuration
echo "Verifying nginx configuration..."
if nginx -t; then
    echo "✓ Nginx configuration is valid"
else
    echo "✗ Nginx configuration has errors!"
    exit 1
fi

# Check if dist files exist
echo "Checking build files..."
if [ -f /usr/share/nginx/html/index.html ]; then
    echo "✓ Build files found"
    ls -lh /usr/share/nginx/html/ | head -5
else
    echo "✗ WARNING: Build files not found!"
    exit 1
fi

# Start nginx
echo "=========================================="
echo "Starting nginx on port ${PORT}..."
echo "=========================================="
exec nginx -g 'daemon off;'

