/**
 * Script para gerar ícones do PWA
 * 
 * Este script cria ícones básicos para o PWA usando Canvas API do Node.js
 * 
 * Requisitos: npm install canvas (ou use uma ferramenta online)
 * 
 * Alternativa: Use https://www.pwabuilder.com/imageGenerator
 */

const fs = require('fs');
const path = require('path');

// Tamanhos de ícones necessários
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Criar diretório de ícones se não existir
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Para gerar os ícones, você tem duas opções:');
console.log('');
console.log('1. Use uma ferramenta online:');
console.log('   - https://www.pwabuilder.com/imageGenerator');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://favicon.io/');
console.log('');
console.log('2. Crie manualmente um ícone 512x512 pixels e use ImageMagick:');
console.log('   convert icon-512x512.png -resize 72x72 icon-72x72.png');
console.log('   (repita para cada tamanho)');
console.log('');
console.log('Os ícones devem ser salvos em: public/icons/');
console.log('Tamanhos necessários:', sizes.join(', '));

