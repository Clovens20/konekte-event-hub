import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimisations de performance
    target: "esnext",
    minify: "esbuild", // Plus rapide que terser
    sourcemap: mode === "development",
    // Code splitting optimisé
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Séparer les dépendances lourdes
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "react-vendor";
            }
            if (id.includes("@radix-ui")) {
              return "ui-vendor";
            }
            if (id.includes("@tanstack/react-query")) {
              return "query-vendor";
            }
            if (id.includes("@supabase")) {
              return "supabase-vendor";
            }
            if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) {
              return "form-vendor";
            }
            // Autres dépendances node_modules dans un chunk séparé
            return "vendor";
          }
          // Les routes admin lazy-loaded seront automatiquement dans des chunks séparés
        },
      },
    },
    // Optimisations de chunks
    chunkSizeWarningLimit: 1000,
    // Compression et optimisation des assets
    assetsInlineLimit: 4096, // Inline les petits assets (< 4kb)
  },
  // Optimisations pour le développement
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
    ],
  },
}));
