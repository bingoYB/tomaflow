import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon-16x16.png", "favicon-32x32.png", "icons/apple-touch-icon.png"],
      manifest: {
        name: "TomaFlow Pomodoro",
        short_name: "TomaFlow",
        description: "Modern Pomodoro tracker with tasks, insights, and multilingual support.",
        theme_color: "#b91c1c",
        background_color: "#1f0a0a",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});
