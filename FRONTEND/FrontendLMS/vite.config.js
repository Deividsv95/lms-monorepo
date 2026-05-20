import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/lms-monorepo/',
  plugins: [react()],
  root: "frontend",
  test: {
    environment: "jsdom",
    setupFiles: "./frontend/src/test/setup.js",
    globals: true,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
