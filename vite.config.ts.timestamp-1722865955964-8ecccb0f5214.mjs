// vite.config.ts
import { defineConfig } from "file:///C:/Users/Nicholas/code/web/viewette-v2/node_modules/vite/dist/node/index.js";
import preact from "file:///C:/Users/Nicholas/code/web/viewette-v2/node_modules/@preact/preset-vite/dist/esm/index.mjs";
import { VitePWA } from "file:///C:/Users/Nicholas/code/web/viewette-v2/node_modules/vite-plugin-pwa/dist/index.js";
var manifest = {
  name: "Viewette v2",
  short_name: "Viewette v2",
  description: "Local Web-based Qualitative Data Analysis",
  theme_color: "#03a9f4",
  icons: [
    {
      src: "taguette.png",
      sizes: "180x180",
      type: "image/png"
    }
  ]
};
var pwaConfig = {
  devOptions: {
    enabled: true,
    type: "module"
  },
  strategies: "injectManifest",
  srcDir: "src",
  filename: "serviceWorker.js",
  registerType: "autoUpdate",
  manifest
  // workbox: {
  //   globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
  // },
};
var vite_config_default = defineConfig({
  plugins: [
    preact(),
    VitePWA({
      ...pwaConfig,
      injectManifest: {
        // maximumFileSizeToCacheInBytes: /*1mb*/ 1000000,
        // swSrc: "./src/serviceWorker.js",
        // swDest: "sw.js",
        // globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      }
    })
  ],
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"]
  },
  build: {
    minify: false
  },
  server: {
    headers: {
      // defaults:
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none"
      // "Cross-Origin-Embedder-Policy": "require-corp",
      // "Cross-Origin-Resource-Policy": "cross-origin",
      // "Cross-Origin-Opener-Policy": "same-origin",
    }
  },
  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none"
    },
    port: 3e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxOaWNob2xhc1xcXFxjb2RlXFxcXHdlYlxcXFx2aWV3ZXR0ZS12MlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTmljaG9sYXNcXFxcY29kZVxcXFx3ZWJcXFxcdmlld2V0dGUtdjJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL05pY2hvbGFzL2NvZGUvd2ViL3ZpZXdldHRlLXYyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHByZWFjdCBmcm9tIFwiQHByZWFjdC9wcmVzZXQtdml0ZVwiO1xyXG5cclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcclxuY29uc3QgbWFuaWZlc3QgPSB7XHJcbiAgbmFtZTogXCJWaWV3ZXR0ZSB2MlwiLFxyXG4gIHNob3J0X25hbWU6IFwiVmlld2V0dGUgdjJcIixcclxuICBkZXNjcmlwdGlvbjogXCJMb2NhbCBXZWItYmFzZWQgUXVhbGl0YXRpdmUgRGF0YSBBbmFseXNpc1wiLFxyXG4gIHRoZW1lX2NvbG9yOiBcIiMwM2E5ZjRcIixcclxuICBpY29uczogW1xyXG4gICAge1xyXG4gICAgICBzcmM6IFwidGFndWV0dGUucG5nXCIsXHJcbiAgICAgIHNpemVzOiBcIjE4MHgxODBcIixcclxuICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmxldCBwd2FDb25maWcgPSB7XHJcbiAgZGV2T3B0aW9uczoge1xyXG4gICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgIHR5cGU6IFwibW9kdWxlXCIsXHJcbiAgICBcclxuICB9LFxyXG4gIHN0cmF0ZWdpZXM6IFwiaW5qZWN0TWFuaWZlc3RcIixcclxuICBzcmNEaXI6IFwic3JjXCIsXHJcbiAgZmlsZW5hbWU6IFwic2VydmljZVdvcmtlci5qc1wiLFxyXG4gIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXHJcbiAgbWFuaWZlc3QsXHJcbiAgLy8gd29ya2JveDoge1xyXG4gIC8vICAgZ2xvYlBhdHRlcm5zOiBbXCIqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Z31cIl0sXHJcbiAgLy8gfSxcclxufSBhcyBjb25zdDtcclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICBwcmVhY3QoKSxcclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICAuLi5wd2FDb25maWcsXHJcbiAgICAgIGluamVjdE1hbmlmZXN0OiB7XHJcbiAgICAgICAgLy8gbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IC8qMW1iKi8gMTAwMDAwMCxcclxuICAgICAgICAvLyBzd1NyYzogXCIuL3NyYy9zZXJ2aWNlV29ya2VyLmpzXCIsXHJcbiAgICAgICAgLy8gc3dEZXN0OiBcInN3LmpzXCIsXHJcbiAgICAgICAgLy8gZ2xvYlBhdHRlcm5zOiBbXCIqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Z31cIl0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgZXhjbHVkZTogW1wiQHNxbGl0ZS5vcmcvc3FsaXRlLXdhc21cIl0sXHJcbiAgfSxcclxuXHJcbiAgYnVpbGQ6IHtcclxuICAgIG1pbmlmeTogZmFsc2UsXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgLy8gZGVmYXVsdHM6XHJcbiAgICAgIFwiQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3lcIjogXCJ1bnNhZmUtbm9uZVwiLFxyXG4gICAgICBcIkNyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3lcIjogXCJ1bnNhZmUtbm9uZVwiLFxyXG5cclxuICAgICAgLy8gXCJDcm9zcy1PcmlnaW4tRW1iZWRkZXItUG9saWN5XCI6IFwicmVxdWlyZS1jb3JwXCIsXHJcbiAgICAgIC8vIFwiQ3Jvc3MtT3JpZ2luLVJlc291cmNlLVBvbGljeVwiOiBcImNyb3NzLW9yaWdpblwiLFxyXG4gICAgICAvLyBcIkNyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5XCI6IFwic2FtZS1vcmlnaW5cIixcclxuICAgIH0sXHJcbiAgfSxcclxuICBwcmV2aWV3OiB7XHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgIFwiQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3lcIjogXCJ1bnNhZmUtbm9uZVwiLFxyXG4gICAgICBcIkNyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3lcIjogXCJ1bnNhZmUtbm9uZVwiLFxyXG4gICAgfSxcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1QsU0FBUyxvQkFBb0I7QUFDN1UsT0FBTyxZQUFZO0FBRW5CLFNBQVMsZUFBZTtBQUN4QixJQUFNLFdBQVc7QUFBQSxFQUNmLE1BQU07QUFBQSxFQUNOLFlBQVk7QUFBQSxFQUNaLGFBQWE7QUFBQSxFQUNiLGFBQWE7QUFBQSxFQUNiLE9BQU87QUFBQSxJQUNMO0FBQUEsTUFDRSxLQUFLO0FBQUEsTUFDTCxPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQUksWUFBWTtBQUFBLEVBQ2QsWUFBWTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLEVBRVI7QUFBQSxFQUNBLFlBQVk7QUFBQSxFQUNaLFFBQVE7QUFBQSxFQUNSLFVBQVU7QUFBQSxFQUNWLGNBQWM7QUFBQSxFQUNkO0FBQUE7QUFBQTtBQUFBO0FBSUY7QUFDQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsTUFDTixHQUFHO0FBQUEsTUFDSCxnQkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS2hCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLHlCQUF5QjtBQUFBLEVBQ3JDO0FBQUEsRUFFQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sU0FBUztBQUFBO0FBQUEsTUFFUCw4QkFBOEI7QUFBQSxNQUM5QixnQ0FBZ0M7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtsQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFNBQVM7QUFBQSxNQUNQLDhCQUE4QjtBQUFBLE1BQzlCLGdDQUFnQztBQUFBLElBQ2xDO0FBQUEsSUFDQSxNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
