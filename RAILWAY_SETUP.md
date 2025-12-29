# Guia de Configuração - Railway Deployment

Este guia explica como configurar corretamente o frontend e backend no Railway para evitar erros de CORS e URL.

## 🔴 Problemas Comuns

### 1. Erro: "POST http://localhost:3001/api/..."
**Causa**: O frontend está tentando acessar o backend no `localhost` do usuário, não no servidor da Railway.

**Solução**: Configure a variável de ambiente `VITE_API_URL` no Railway com a URL real do seu backend.

### 2. Erro: "CORS policy: Access-Control-Allow-Origin"
**Causa**: O backend não está configurado para aceitar requisições do domínio do frontend na Railway.

**Solução**: Configure o CORS no backend para incluir a URL do frontend na Railway.

---

## ✅ Configuração no Railway

### Frontend (Este Projeto)

1. **Acesse o painel do Railway**
   - Vá para seu projeto
   - Selecione o serviço do frontend

2. **Configure Variáveis de Ambiente**
   - Vá em **Variables**
   - Adicione as seguintes variáveis:

   | Nome | Valor | Descrição |
   |------|-------|-----------|
   | `BACKEND_INTERNAL_URL` | `http://backend.railway.internal` | URL da rede privada do backend (opcional, padrão já configurado) |
   | `GEMINI_API_KEY` | `sua-chave-api-gemini` | Chave da API do Google Gemini |

   ⚠️ **Importante**: 
   - O frontend usa um **proxy nginx** que roteia `/api` para o backend via rede privada
   - Não é necessário configurar `VITE_API_URL` em produção (o código usa `/api` automaticamente)
   - Se o nome do serviço do backend for diferente de `backend`, ajuste `BACKEND_INTERNAL_URL`
   - Exemplo: Se o serviço se chama `api`, use `http://api.railway.internal`

3. **Verifique o Domain Público**
   - Vá em **Settings** → **Networking**
   - Certifique-se de que há um **Public Domain** configurado
   - Anote a URL (ex: `https://ozeassist-front-production.up.railway.app`)

### Backend (Outro Serviço)

1. **Configure Variáveis de Ambiente**
   - No serviço do backend, adicione:
   - `PORT` (geralmente já configurado automaticamente pelo Railway)

2. **Configure CORS no Código do Backend**

   ⚠️ **Com o proxy nginx, o CORS não é mais necessário!**
   
   Como o frontend agora faz requisições para `/api` (mesmo domínio), o navegador não envia requisições cross-origin. 
   
   **Se ainda quiser manter CORS para desenvolvimento local:**
   ```javascript
   const cors = require('cors');
   
   const corsOptions = {
     origin: [
       'http://localhost:3000', // Desenvolvimento local
       // Não precisa mais da URL do Railway em produção
     ],
     credentials: true,
     optionsSuccessStatus: 200
   };
   
   app.use(cors(corsOptions));
   ```

   ⚠️ **Nota**: Com o proxy, as requisições do frontend chegam ao backend como se viessem do mesmo domínio, então CORS não é necessário em produção.

3. **Verifique o Domain Público**
   - Vá em **Settings** → **Networking**
   - Certifique-se de que há um **Public Domain** configurado
   - Anote a URL (você precisará dela para configurar o frontend)

---

## 🔄 Fluxo de Requisições

### Com Proxy Nginx (Configuração Atual)

```
Navegador do Usuário
    ↓ (Requisição para /api)
Frontend Railway (https://ozeassist-front-production.up.railway.app/api)
    ↓ (Proxy nginx - rede privada)
Backend Railway (backend.railway.internal)
    ↓ (Resposta)
Frontend Railway (nginx)
    ↓
Navegador do Usuário
```

**Vantagens:**
- ✅ Sem problemas de CORS (mesmo domínio)
- ✅ Comunicação via rede privada (mais rápido e seguro)
- ✅ Não expõe a URL do backend publicamente

---

## 🧪 Como Testar

1. **Verifique se as variáveis estão configuradas**
   - No Railway, vá em **Variables** e confirme que `VITE_API_URL` e `GEMINI_API_KEY` estão presentes

2. **Faça um novo deploy**
   - Após adicionar/modificar variáveis, faça um novo deploy
   - As variáveis são injetadas durante o build

3. **Teste no navegador**
   - Abra o console do navegador (F12)
   - Tente fazer login ou registrar
   - Verifique se não há erros de CORS ou 404

4. **Verifique os logs**
   - No Railway, vá em **Deployments** → **View Logs**
   - Procure por erros durante o build ou runtime

---

## 📝 Checklist Final

- [ ] Variável `GEMINI_API_KEY` configurada no frontend
- [ ] Variável `BACKEND_INTERNAL_URL` configurada (opcional, padrão: `http://backend.railway.internal`)
- [ ] Nome do serviço do backend no Railway corresponde ao usado na URL (padrão: `backend`)
- [ ] Frontend tem Public Domain configurado
- [ ] Backend está rodando e acessível via rede privada
- [ ] Novo deploy realizado após configurar variáveis
- [ ] Testado no navegador e funcionando

---

## 🆘 Troubleshooting

### "Ainda está usando localhost:3001"
- Verifique se a variável `VITE_API_URL` está configurada no Railway
- Confirme que fez um novo deploy após adicionar a variável
- Verifique os logs do build para ver se a variável foi injetada

### "Erro de CORS persiste"
- Verifique se a URL do frontend está na lista de `origin` do CORS no backend
- Confirme que o backend está rodando e acessível
- Verifique se o backend está retornando os headers CORS corretos

### "API Key não funciona"
- Verifique se `GEMINI_API_KEY` está configurada no Railway
- Confirme que a chave está correta e válida
- Verifique os logs do build para ver se a variável foi injetada

---

## 📚 Referências

- [Railway Documentation - Environment Variables](https://docs.railway.app/develop/variables)
- [Vite - Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

