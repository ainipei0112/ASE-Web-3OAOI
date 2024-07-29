import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
  ],
  server: {
    // port 指定為 3000
    port: 3000,
  }
});
