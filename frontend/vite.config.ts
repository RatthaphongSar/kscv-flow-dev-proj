import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command }) => {
  const keyPath = path.resolve(__dirname, '..', 'backend', 'certs', 'localhost-key.pem');
  const certPath = path.resolve(__dirname, '..', 'backend', 'certs', 'localhost.pem');
  const enableHttps = command === 'serve' && fs.existsSync(keyPath) && fs.existsSync(certPath);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        recharts: 'recharts/es6',
      },
    },
    optimizeDeps: {
      include: ['recharts'],
    },
    ssr: {
      noExternal: ['recharts'],
    },
    build: {
      commonjsOptions: {
        include: [/recharts/, /node_modules/],
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      ...(enableHttps
        ? {
            https: {
              key: fs.readFileSync(keyPath),
              cert: fs.readFileSync(certPath),
            },
          }
        : {}),
    },
  };
});
