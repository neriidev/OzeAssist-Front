# Ícones do PWA

Este diretório deve conter os seguintes ícones para o PWA funcionar corretamente:

- `icon-72x72.png` - 72x72 pixels
- `icon-96x96.png` - 96x96 pixels
- `icon-128x128.png` - 128x128 pixels
- `icon-144x144.png` - 144x144 pixels
- `icon-152x152.png` - 152x152 pixels
- `icon-192x192.png` - 192x192 pixels (obrigatório)
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels (obrigatório)

## Como criar os ícones

1. Crie um ícone base de 512x512 pixels com o logo "OA" ou o logo do OzeAssist
2. Use uma ferramenta online como https://realfavicongenerator.net/ ou https://www.pwabuilder.com/imageGenerator
3. Ou use um script para gerar todos os tamanhos a partir de uma imagem base

## Características recomendadas

- Fundo: Cor teal (#0d9488) ou transparente
- Texto/Logo: Branco ou contraste alto
- Formato: PNG com transparência
- Estilo: Rounded corners (opcional, mas recomendado para iOS)

## Gerador rápido

Você pode usar o seguinte comando se tiver ImageMagick instalado:

```bash
# Criar um ícone base 512x512
convert -size 512x512 xc:#0d9488 -gravity center -pointsize 200 -fill white -annotate +0+0 "OA" icon-512x512.png

# Gerar todos os tamanhos
for size in 72 96 128 144 152 192 384 512; do
  convert icon-512x512.png -resize ${size}x${size} icon-${size}x${size}.png
done
```

Ou use uma ferramenta online como:
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/
- https://favicon.io/

