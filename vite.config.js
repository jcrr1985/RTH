import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      exclude: [/node_modules/],
      babel: {
        plugins: ["macros", "@emotion"],
      },
    }),
  ],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  build: {
    sourcemap: false,
    cssMinify: true,
  },
});
