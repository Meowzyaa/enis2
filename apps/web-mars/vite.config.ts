import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 8080,
  },
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      registerType: "autoUpdate",
      manifest: {
        name: "NovaNIS",
        short_name: "NovaNIS",
        description: "Electronic diary: report card and grades for NIS",
        theme_color: "#f86f5e",
        background_color: "#0f1712",
        display: "standalone",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
})
