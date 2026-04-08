import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/chat": "http://localhost:8000",
      "/clusters": "http://localhost:8000",
      "/network": "http://localhost:8000",
      "/search": "http://localhost:8000",
      "/timeseries": "http://localhost:8000",
    },
  },
});