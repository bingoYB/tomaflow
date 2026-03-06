import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const normalizeBasePath = (value: string): string => {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
};

const basePath = normalizeBasePath(process.env.VITE_BASE_PATH ?? "/");

export default defineConfig({
  base: basePath,
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
        start_url: basePath,
        scope: basePath,
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
