// vite.config.js
import { defineConfig } from "file:///home/jk/AppRTH/rth/node_modules/vite/dist/node/index.js";
import react from "file:///home/jk/AppRTH/rth/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import imagemin from "file:///home/jk/AppRTH/rth/node_modules/imagemin/index.js";
import imageminPngquant from "file:///home/jk/AppRTH/rth/node_modules/imagemin-pngquant/index.js";
import imageminJpegtran from "file:///home/jk/AppRTH/rth/node_modules/imagemin-jpegtran/index.js";
import imageminSvgo from "file:///home/jk/AppRTH/rth/node_modules/imagemin-svgo/index.js";
import { terser } from "file:///home/jk/AppRTH/rth/node_modules/rollup-plugin-terser/rollup-plugin-terser.mjs";
import cssnano from "file:///home/jk/AppRTH/rth/node_modules/cssnano/src/index.js";
var __vite_injected_original_dirname = "/home/jk/AppRTH/rth";
var vite_config_default = defineConfig({
  plugins: [
    react({
      exclude: [/node_modules/],
      babel: {
        plugins: ["macros", "@emotion"]
      }
    }),
    terser(),
    cssnano()
  ],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__vite_injected_original_dirname, "./src") }
    ]
  },
  build: {
    onEnd: async () => {
      await imagemin(["src/assets/images/clinics*.{jpg,jpeg,png,svg}"], {
        destination: "build/images",
        plugins: [
          imageminPngquant(),
          imageminJpegtran(),
          imageminSvgo()
        ]
      });
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9qay9BcHBSVEgvcnRoXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9qay9BcHBSVEgvcnRoL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2prL0FwcFJUSC9ydGgvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBpbWFnZW1pbiBmcm9tICdpbWFnZW1pbic7XG5pbXBvcnQgaW1hZ2VtaW5QbmdxdWFudCBmcm9tICdpbWFnZW1pbi1wbmdxdWFudCc7XG5pbXBvcnQgaW1hZ2VtaW5KcGVndHJhbiBmcm9tICdpbWFnZW1pbi1qcGVndHJhbic7XG5pbXBvcnQgaW1hZ2VtaW5TdmdvIGZyb20gJ2ltYWdlbWluLXN2Z28nO1xuaW1wb3J0IHsgdGVyc2VyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi10ZXJzZXInO1xuaW1wb3J0IGNzc25hbm8gZnJvbSAnY3NzbmFubyc7XG5cblxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KHtcbiAgICAgIGV4Y2x1ZGU6IFsvbm9kZV9tb2R1bGVzL10sXG4gICAgICBiYWJlbDoge1xuICAgICAgICBwbHVnaW5zOiBbJ21hY3JvcycsICdAZW1vdGlvbiddLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICB0ZXJzZXIoKSxcbiAgICBjc3NuYW5vKCksXG5cbiAgXSwgcmVzb2x2ZToge1xuICAgIGFsaWFzOiBbXG4gICAgICB7IGZpbmQ6ICdAJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpIH0sXG4gICAgXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICAvLyBBZ3JlZ2EgbGEgdGFyZWEgcGVyc29uYWxpemFkYSBhbCBldmVudG8gYG9uRW5kYCBkZSBsYSBjb25zdHJ1Y2NpXHUwMEYzbiBkZSBwcm9kdWNjaVx1MDBGM25cbiAgICBvbkVuZDogYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgaW1hZ2VtaW4oWydzcmMvYXNzZXRzL2ltYWdlcy9jbGluaWNzKi57anBnLGpwZWcscG5nLHN2Z30nXSwge1xuICAgICAgICBkZXN0aW5hdGlvbjogJ2J1aWxkL2ltYWdlcycsXG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICBpbWFnZW1pblBuZ3F1YW50KCksXG4gICAgICAgICAgaW1hZ2VtaW5KcGVndHJhbigpLFxuICAgICAgICAgIGltYWdlbWluU3ZnbygpLFxuICAgICAgICBdLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyTyxTQUFTLG9CQUFvQjtBQUN4USxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sY0FBYztBQUNyQixPQUFPLHNCQUFzQjtBQUM3QixPQUFPLHNCQUFzQjtBQUM3QixPQUFPLGtCQUFrQjtBQUN6QixTQUFTLGNBQWM7QUFDdkIsT0FBTyxhQUFhO0FBUnBCLElBQU0sbUNBQW1DO0FBYXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLFNBQVMsQ0FBQyxjQUFjO0FBQUEsTUFDeEIsT0FBTztBQUFBLFFBQ0wsU0FBUyxDQUFDLFVBQVUsVUFBVTtBQUFBLE1BQ2hDO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsRUFFVjtBQUFBLEVBQUcsU0FBUztBQUFBLElBQ1YsT0FBTztBQUFBLE1BQ0wsRUFBRSxNQUFNLEtBQUssYUFBYSxLQUFLLFFBQVEsa0NBQVcsT0FBTyxFQUFFO0FBQUEsSUFDN0Q7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFFTCxPQUFPLFlBQVk7QUFDakIsWUFBTSxTQUFTLENBQUMsK0NBQStDLEdBQUc7QUFBQSxRQUNoRSxhQUFhO0FBQUEsUUFDYixTQUFTO0FBQUEsVUFDUCxpQkFBaUI7QUFBQSxVQUNqQixpQkFBaUI7QUFBQSxVQUNqQixhQUFhO0FBQUEsUUFDZjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
