import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'web',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['cubing'],
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
