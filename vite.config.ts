import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
import preact from '@preact/preset-vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(),],
  // build to docs folder for github pages
  build: {
    outDir: "docs",
  },
  base: "/viewette/",
  server: {
    headers: {
      // defaults:
      // "Cross-Origin-Opener-Policy": "unsafe-none",
      // "Cross-Origin-Embedder-Policy": "unsafe-none",

      // needed for SharedArrayBuffer
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Cross-Origin-Opener-Policy": "same-origin",

    },
  },
});
