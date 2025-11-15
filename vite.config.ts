import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const TMDB_API_KEY_V3 = env.TMDB_API_KEY_V3;

    if (!TMDB_API_KEY_V3) {
        throw new Error('TMDB_API_KEY_V3 is not defined in your environment variables. Please add it to your .env file for local development.');
    }

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/tmdb': {
            target: 'https://api.themoviedb.org/3',
            changeOrigin: true,
            rewrite: (path) => {
              const rewrittenPath = path.replace(/^\/tmdb/, '');
              // Use the URL API for robust query parameter handling
              const url = new URL(`http://localhost${rewrittenPath}`);
              url.searchParams.append('api_key', TMDB_API_KEY_V3);
              return `${url.pathname}${url.search}`;
            },
          },
        },
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      }
    };
});