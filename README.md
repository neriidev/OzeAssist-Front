<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# OzeAssist - Assistente de Tratamento

Aplicação frontend para gerenciamento de tratamento com Ozempic (semaglutida).

View your app in AI Studio: https://ai.studio/apps/drive/1zEjr53CldCXCVquRu_S-f35Tr5wtksG1

## 🚀 Executar Localmente

**Pré-requisitos:** Node.js

1. Instalar dependências:
   ```bash
   npm install
   ```

2. Configurar variáveis de ambiente:
   - Crie um arquivo `.env.local` na raiz do projeto
   - Adicione:
     ```
     GEMINI_API_KEY=sua-chave-api-gemini
     VITE_API_URL=http://localhost:3001/api
     ```

3. Executar a aplicação:
   ```bash
   npm run dev
   ```

4. Acesse: `http://localhost:3000`

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## 📱 PWA (Progressive Web App)

Este aplicativo é um PWA e pode ser instalado no dispositivo do usuário.

### Funcionalidades PWA:

- ✅ **Instalável**: Pode ser instalado como app nativo
- ✅ **Offline**: Funciona offline com service worker
- ✅ **Atualização automática**: Service worker atualiza automaticamente
- ✅ **Ícones e splash screen**: Experiência nativa
- ✅ **Notificação de instalação**: Prompt automático para instalar

### Gerar Ícones:

1. Crie um ícone base de 512x512 pixels
2. Use uma ferramenta online:
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/
   - https://favicon.io/
3. Salve os ícones em `public/icons/` com os tamanhos: 72, 96, 128, 144, 152, 192, 384, 512

Veja mais detalhes em `public/icons/README.md`

## 🚂 Deploy no Railway

Para instruções detalhadas sobre como configurar o deploy no Railway, consulte o arquivo **[RAILWAY_SETUP.md](./RAILWAY_SETUP.md)**.

### Configuração Rápida:

1. **Variáveis de Ambiente no Railway:**
   - `VITE_API_URL`: URL completa do backend (ex: `https://seu-backend.railway.app/api`)
   - `GEMINI_API_KEY`: Chave da API do Google Gemini

2. **Importante:**
   - Configure o CORS no backend para aceitar requisições do domínio do frontend
   - Certifique-se de que ambos os serviços têm Public Domain configurado

Veja o guia completo em [RAILWAY_SETUP.md](./RAILWAY_SETUP.md).



