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
# Prioridade: BACKEND_INTERNAL_URL > padrão (backend.railway.internal:8080) > BACKEND_PUBLIC_URL
# IMPORTANTE: Rede privada sempre usa HTTP, não HTTPS
if [ -n "$BACKEND_INTERNAL_URL" ]; then
    BACKEND_URL="$BACKEND_INTERNAL_URL"
    # Garantir que rede privada use HTTP
    BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|^https://backend\.railway\.internal|http://backend.railway.internal|')
    BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|^https://.*\.railway\.internal|http://&|')
    echo "Using BACKEND_INTERNAL_URL: ${BACKEND_URL}"
elif [ -n "$BACKEND_PUBLIC_URL" ]; then
    # Se usar URL pública, manter como está (pode ser HTTPS)
    BACKEND_URL="$BACKEND_PUBLIC_URL"
    echo "Using BACKEND_PUBLIC_URL: ${BACKEND_URL}"
    echo "⚠️  Consider using BACKEND_INTERNAL_URL for better performance"
else
    # Usar rede privada com porta 8080 (porta padrão do backend no Railway)
    # SEMPRE usar HTTP na rede privada
    BACKEND_PORT_DEFAULT=${BACKEND_PORT:-8080}
    BACKEND_URL="http://backend.railway.internal:${BACKEND_PORT_DEFAULT}"
    echo "Using default private network URL: ${BACKEND_URL}"
fi

# Se BACKEND_PORT estiver definida e a URL não tiver porta, adicionar
if [ -n "$BACKEND_PORT" ]; then
    # Verificar se a URL já tem porta
    if ! echo "$BACKEND_URL" | grep -q ":[0-9]"; then
        BACKEND_URL="${BACKEND_URL}:${BACKEND_PORT}"
        echo "Backend URL with port: ${BACKEND_URL}"
    fi
fi

# Remover /api do final da URL se estiver presente (o nginx.conf já adiciona)
BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|/api/*$||')

# Garantir que URLs da rede privada sempre usem HTTP
if echo "$BACKEND_URL" | grep -q "\.railway\.internal"; then
    BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|^https://|http://|')
    echo "Forced HTTP for private network: ${BACKEND_URL}"
fi

echo "Final Backend URL (base): ${BACKEND_URL}"
echo "Updating backend proxy configuration..."

# Verificar se o placeholder existe no arquivo
if ! grep -q "BACKEND_INTERNAL_URL_PLACEHOLDER" /etc/nginx/conf.d/default.conf; then
    echo "⚠️  WARNING: BACKEND_INTERNAL_URL_PLACEHOLDER not found in nginx.conf!"
    echo "Current nginx.conf proxy_pass line:"
    grep "proxy_pass" /etc/nginx/conf.d/default.conf || echo "No proxy_pass found!"
fi

sed -i "s|BACKEND_INTERNAL_URL_PLACEHOLDER|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

# Verificar se a substituição funcionou
echo "Verifying proxy configuration after replacement:"
grep "proxy_pass" /etc/nginx/conf.d/default.conf | head -1

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

