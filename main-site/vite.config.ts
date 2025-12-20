import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    manifest: true, // 生成 manifest.json 供 SSR 脚本使用
    target: 'esnext',
    minify: 'esbuild',
  },
  server: {
    port: 5174,
    host: true
  },
  base: './',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  optimizeDeps: {
    exclude: ['cubing'] // 排除有问题的依赖
  }
});