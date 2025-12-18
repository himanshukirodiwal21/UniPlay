// // vite.config.js
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// const repoName = "UniPlay";

// export default defineConfig(({ command }) => ({
//   plugins: [react()],

//   // GitHub Pages ke liye base config (tumhare code jaisa)
//   base: command === "serve" ? "/" : `/${repoName}/`,

//   // 🟢 MOST IMPORTANT: server ko LAN/mobile access allow karna
//   server: {
//     host: true,       // ← mobile se access possible
//     port: 5173,       // ← fixed port (change kar sakte ho)
//     strictPort: false // ← busy ho to next port le lega
//   }
// }));


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false
  }
});
