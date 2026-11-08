import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * A configuração da v1 tinha vários problemas de fundo:
 *
 *  - `build.onEnd` não existe em Vite. O bloco de otimização de imagens nunca
 *    correu, apesar de o imagemin estar instalado (e de arrastar dezenas de
 *    dependências transitivas).
 *  - `terser()` e `cssnano()` estavam na lista de `plugins`. O terser é um
 *    plugin de Rollup e o cssnano é de PostCSS: nenhum é um plugin de Vite.
 *    Além disso o Vite já minifica por si.
 *  - `server: { hmr: ... }` estava aninhado DENTRO das opções do imagemin,
 *    portanto não configurava nada.
 *  - `__dirname` não existe em módulos ESM, e o package.json declara
 *    `"type": "module"`.
 */
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    // Visible na rede local (p. ex. o PC de outra pessoa em casa).
    host: true,
    // O browser fala só com o Vite; o Vite reencaminha /api para o servidor.
    // Assim funciona de qualquer PC sem mudar URLs nem CORS.
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
  preview: {
    host: true,
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    // O Vite minifica com esbuild por omissão; é mais rápido que o terser e
    // suficiente aqui.
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Separa o que muda raramente do nosso código, para a cache do browser
        // não ser invalidada a cada deploy.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          leaflet: ['leaflet'],
        },
      },
    },
  },
});
