import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      strict: false,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "xlsx"],
  },
  optimizeDeps: {
    force: true,
  },
  esbuild: {
    logOverride: { 'duplicate-attribute': 'silent' },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split large vendor libs into separate chunks to reduce memory
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('mapbox-gl') || id.includes('@turf')) return 'vendor-maps';
            if (id.includes('@mui')) return 'vendor-mui';
            if (id.includes('xlsx') || id.includes('jspdf')) return 'vendor-export';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('chart.js') || id.includes('react-chartjs')) return 'vendor-chartjs';
          }
        },
      },
    },
  },
}));
