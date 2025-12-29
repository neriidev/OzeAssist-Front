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
   | `BACKEND_INTERNAL_URL` | `http://backend.railway.internal:8080` | URL da rede privada do backend com porta (opcional) |
   | `BACKEND_PUBLIC_URL` | `https://backend-production-fe3d.up.railway.app` | URL pública do backend (fallback se rede privada não funcionar) |
   | `BACKEND_PORT` | `8080` | Porta do backend (padrão: 8080, opcional se já estiver na URL) |
   | `GEMINI_API_KEY` | `sua-chave-api-gemini` | Chave da API do Google Gemini |

   ⚠️ **Importante**: 
   - O frontend usa um **proxy nginx** que roteia `/api` para o backend
   - **Prioridade**: `BACKEND_INTERNAL_URL` > padrão (`backend.railway.internal:8080`) > `BACKEND_PUBLIC_URL`
   - **Padrão automático**: Se nenhuma variável for configurada, usa `http://backend.railway.internal:8080`
   - **CRÍTICO**: Rede privada sempre usa **HTTP**, nunca HTTPS
   - Se o nome do serviço do backend for diferente de `backend`, ajuste `BACKEND_INTERNAL_URL`
   - Exemplo: Se o serviço se chama `api` e roda na porta 3000, use `http://api.railway.internal:3000`
   - **NÃO configure** `BACKEND_PUBLIC_URL` a menos que a rede privada não funcione (use HTTP na rede privada sempre)
   - Se tiver erro 504/502, verifique se não está usando HTTPS na rede privada

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

### "504 Gateway Timeout" ou "upstream timed out" com HTTPS

**Sintoma**: Logs mostram `upstream: "https://66.33.22.109:8080"` ou similar

**Causa**: O nginx está tentando usar HTTPS na rede privada, mas a rede privada do Railway só funciona com HTTP.

**Solução**:
1. **Remova a variável `BACKEND_PUBLIC_URL`** se estiver configurada no frontend
2. **Configure `BACKEND_INTERNAL_URL`** com HTTP (não HTTPS):
   - Nome: `BACKEND_INTERNAL_URL`
   - Valor: `http://backend.railway.internal:8080` (use HTTP, não HTTPS!)
3. Ou **não configure nenhuma variável** - o sistema usará automaticamente `http://backend.railway.internal:8080`
4. Faça um novo deploy

**Importante**: A rede privada do Railway (`*.railway.internal`) **sempre** usa HTTP, nunca HTTPS.

### "502 Bad Gateway" ao fazer login/registro

Este erro indica que o nginx não consegue conectar ao backend. Siga estes passos:

1. **Verifique o nome do serviço do backend no Railway**
   - No painel do Railway, veja qual é o nome exato do serviço do backend
   - O nome deve corresponder na URL: `http://NOME_DO_SERVICO.railway.internal`

2. **Configure a variável `BACKEND_INTERNAL_URL`**
   - No frontend, adicione a variável `BACKEND_INTERNAL_URL`
   - Use: `http://NOME_DO_SERVICO.railway.internal:PORT`
   - Exemplo: Se o serviço se chama `api` e roda na porta `3000`, use `http://api.railway.internal:3000`

3. **Se a rede privada não funcionar, use URL pública**
   - Adicione a variável `BACKEND_PUBLIC_URL` no frontend
   - Use a URL pública do backend: `https://seu-backend.railway.app`
   - Isso fará o proxy usar a URL pública em vez da rede privada

4. **Verifique se o backend está rodando**
   - No Railway, vá no serviço do backend
   - Verifique os logs para ver se está rodando corretamente
   - Confirme que está escutando na porta correta

5. **Verifique os logs do frontend**
   - No Railway, vá no serviço do frontend → Deployments → View Logs
   - Procure pela mensagem "Final Backend URL" para ver qual URL está sendo usada
   - Verifique se há erros de conexão

### "Ainda está usando localhost:3001"
- Isso não deve acontecer em produção (o código usa `/api` automaticamente)
- Se acontecer, verifique se `import.meta.env.PROD` está sendo detectado corretamente

### "Erro de CORS persiste"
- Com o proxy nginx, CORS não deve ser necessário
- Se ainda houver erro, verifique se o backend está configurado corretamente

### "API Key não funciona"
- Verifique se `GEMINI_API_KEY` está configurada no Railway
- Confirme que a chave está correta e válida
- Verifique os logs do build para ver se a variável foi injetada

---

## 📚 Referências

- [Railway Documentation - Environment Variables](https://docs.railway.app/develop/variables)
- [Vite - Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

