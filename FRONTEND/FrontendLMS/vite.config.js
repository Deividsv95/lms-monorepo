import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/lms-monorepo/',
  plugins: [react()],
  root: "frontend",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
