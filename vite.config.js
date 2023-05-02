import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminSvgo from 'imagemin-svgo';
import { terser } from 'rollup-plugin-terser';
import cssnano from 'cssnano';



// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      exclude: [/node_modules/],
      babel: {
        plugins: ['macros', '@emotion'],
      },
    }),
    terser(),
    cssnano(),
  ], resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  build: {
    // Agrega la tarea personalizada al evento `onEnd` de la construcción de producción
    onEnd: async () => {
      await imagemin(['src/assets/images/clinics*.{jpg,jpeg,png,svg}'], {
        destination: 'build/images',
        plugins: [
          imageminPngquant(),
          imageminJpegtran(),
          imageminSvgo(),
        ],
        server: {
 hmr: {
 overlay: false,
 },
 },
      });
    }
  }
})
