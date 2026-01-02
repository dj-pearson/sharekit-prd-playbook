import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { generateSitemap } from "./scripts/generate-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js and related 3D libraries into separate chunk
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // Split React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split charting library (heavy)
          'charts': ['recharts'],
          // Split Supabase client
          'supabase': ['@supabase/supabase-js'],
          // Split TanStack Query
          'query': ['@tanstack/react-query'],
          // Split animation libraries
          'motion': ['framer-motion'],
        }
      }
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: 'generate-sitemap',
      async closeBundle() {
        // Generate sitemap after build (async to fetch from Supabase)
        if (mode === 'production') {
          await generateSitemap('./dist', 'https://sharekit.net');
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
