import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5174,
    // @ts-ignore
    allowedHosts: ['online-typical-aging-lived.trycloudflare.com', 'outlined-divorce-such-appendix.trycloudflare.com', '.trycloudflare.com', '.loca.lt', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5174,
    // @ts-ignore
    allowedHosts: ['online-typical-aging-lived.trycloudflare.com', 'outlined-divorce-such-appendix.trycloudflare.com', '.trycloudflare.com', '.loca.lt', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
