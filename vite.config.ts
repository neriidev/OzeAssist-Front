import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Usar variáveis de ambiente do sistema como fallback (importante para Docker/Railway)
    const geminiApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL || '';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(geminiApiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
        // Expor VITE_API_URL para o código do cliente
        'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
