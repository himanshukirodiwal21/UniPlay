// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = "UniPlay";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "serve" ? "/" : `/${repoName}/`,
}));
