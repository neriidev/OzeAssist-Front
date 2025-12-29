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

# Configurar URL do backend
# Prioridade: BACKEND_INTERNAL_URL > BACKEND_PUBLIC_URL > padrão (backend.railway.internal)
if [ -n "$BACKEND_INTERNAL_URL" ]; then
    BACKEND_URL="$BACKEND_INTERNAL_URL"
    echo "Using BACKEND_INTERNAL_URL: ${BACKEND_URL}"
elif [ -n "$BACKEND_PUBLIC_URL" ]; then
    BACKEND_URL="$BACKEND_PUBLIC_URL"
    echo "Using BACKEND_PUBLIC_URL: ${BACKEND_URL}"
else
    # Tentar rede privada com porta padrão do Railway (80)
    BACKEND_URL="http://backend.railway.internal"
    echo "Using default private network URL: ${BACKEND_URL}"
    echo "⚠️  If this doesn't work, set BACKEND_INTERNAL_URL or BACKEND_PUBLIC_URL"
fi

# Se BACKEND_PORT estiver definida, adicionar à URL
if [ -n "$BACKEND_PORT" ]; then
    # Remover porta existente se houver e adicionar a nova
    BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|:\([0-9]*\)$||')
    BACKEND_URL="${BACKEND_URL}:${BACKEND_PORT}"
    echo "Backend URL with port: ${BACKEND_URL}"
fi

# Remover /api do final da URL se estiver presente (o nginx.conf já adiciona)
BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|/api/*$||')

echo "Final Backend URL (base): ${BACKEND_URL}"
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

