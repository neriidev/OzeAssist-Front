import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

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
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'icons/*.png'],
          manifest: {
            name: 'OzeAssist - Assistente de Tratamento',
            short_name: 'OzeAssist',
            description: 'Assistente virtual para acompanhamento de tratamento com Ozempic',
            theme_color: '#0d9488',
            background_color: '#f8fafc',
            display: 'standalone',
            display_override: ['standalone', 'fullscreen', 'minimal-ui'],
            orientation: 'portrait-primary',
            scope: '/',
            start_url: '/?standalone=true',
            prefer_related_applications: false,
            icons: [
              {
                src: '/icons/icon-72x72.png',
                sizes: '72x72',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/icons/icon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/icons/icon-128x128.png',
                sizes: '128x128',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/icons/icon-144x144.png',
                sizes: '144x144',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/icons/icon-152x152.png',
                sizes: '152x152',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/icons/icon-384x384.png',
                sizes: '384x384',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ],
            shortcuts: [
              {
                name: 'Registrar Injeção',
                short_name: 'Injeção',
                description: 'Registrar nova aplicação',
                url: '/?action=injection',
                icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
              },
              {
                name: 'Registrar Saúde',
                short_name: 'Saúde',
                description: 'Registrar dados de saúde',
                url: '/?action=health',
                icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
              }
            ],
            categories: ['health', 'medical', 'lifestyle']
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'tailwind-cache',
                  expiration: {
                    maxEntries: 1,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
                  }
                }
              },
              {
                urlPattern: /^https:\/\/esm\.sh\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'esm-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 7 // 7 dias
                  }
                }
              },
              {
                urlPattern: /\/api\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 5 // 5 minutos
                  },
                  networkTimeoutSeconds: 10
                }
              }
            ]
          },
          devOptions: {
            enabled: true,
            type: 'module'
          }
        })
      ],
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
