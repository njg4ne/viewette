import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

import { VitePWA } from "vite-plugin-pwa";
const manifest = {
  name: "Viewette v2",
  short_name: "Viewette v2",
  description: "Local Web-based Qualitative Data Analysis",
  theme_color: "#03a9f4",
  icons: [
    {
      src: "taguette.png",
      sizes: "180x180",
      type: "image/png",
    },
  ],
};

let pwaConfig = {
  devOptions: {
    enabled: false,
    type: "module",
  },
  strategies: "injectManifest",
  srcDir: "src",
  filename: "serviceWorker.js",
  registerType: "autoUpdate",
  manifest,
  // workbox: {
  //   globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
  // },
} as const;
export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      ...pwaConfig,
      injectManifest: {
        // maximumFileSizeToCacheInBytes: /*1mb*/ 1000000,
        // swSrc: "./src/serviceWorker.js",
        // swDest: "sw.js",
        // globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },

  build: {
    minify: false,
  },
  server: {
    headers: {
      // defaults:
      // "Cross-Origin-Opener-Policy": "unsafe-none",
      // "Cross-Origin-Embedder-Policy": "unsafe-none",

      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  // preview: {
  //   headers: {
  //     "Cross-Origin-Opener-Policy": "unsafe-none",
  //     "Cross-Origin-Embedder-Policy": "unsafe-none",
  //   },
  // },
});
