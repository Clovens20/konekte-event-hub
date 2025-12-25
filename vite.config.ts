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
    // Laisser Vite gérer le code splitting automatiquement
    // Les lazy-loaded components seront automatiquement dans des chunks séparés
    // Optimisations de chunks
    chunkSizeWarningLimit: 1000,
    // Compression et optimisation des assets
    assetsInlineLimit: 4096, // Inline les petits assets (< 4kb)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  // Optimisations pour le développement
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-router-dom",
      "@tanstack/react-query",
    ],
    esbuildOptions: {
      jsx: "automatic",
    },
  },
}));
