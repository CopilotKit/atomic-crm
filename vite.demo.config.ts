import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import createHtmlPlugin from "vite-plugin-simple-html";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: process.env.NODE_ENV !== "CI",
      filename: "./dist/stats.html",
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          mainScript: `demo/main.tsx`,
        },
      },
    }),
  ],
  define: {
    "import.meta.env.VITE_IS_DEMO": JSON.stringify("true"),
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL ?? "https://demo.example.org",
    ),
    "import.meta.env.VITE_SB_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_SB_PUBLISHABLE_KEY ?? "https://demo.example.org",
    ),
  },
  base: "./",
  esbuild: {
    keepNames: true,
  },
  build: {
    sourcemap: true,
  },
  server: {
    proxy: {
      // Forward ALL /api/* paths so tools that hit /api/leads, /api/contacts,
      // /api/audit, etc. work too (not just /api/copilotkit). Set
      // COPILOTKIT_PROXY_TARGET to the deployed runtime URL to dev against
      // prod without running the local copilot server.
      "/api": {
        target: process.env.COPILOTKIT_PROXY_TARGET || "http://localhost:4000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
