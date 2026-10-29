import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      "/auth": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
      "/students": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
      "/attendance": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
      "/results": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      "/auth": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
      "/students": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
      "/attendance": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
      "/results": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
});
