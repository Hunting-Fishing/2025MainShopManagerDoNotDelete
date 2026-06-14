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
  optimizeDeps: {},
  esbuild: {
    logOverride: { 'duplicate-attribute': 'silent' },
  },
  build: {
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Recharts, d3, react-smooth, and react-is have circular dependencies.
            // They must initialize from the same chunk to avoid TDZ crashes like
            // "Cannot access 'P' before initialization" in production bundles.
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor') || id.includes('react-smooth') || id.includes('react-is') || id.includes('chart.js') || id.includes('react-chartjs')) return 'vendor-charts';
            if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-popover') || id.includes('@radix-ui/react-dropdown')) return 'vendor-radix-overlay';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('mapbox-gl')) return 'vendor-mapbox';
            if (id.includes('@turf')) return 'vendor-turf';
            if (id.includes('@mui')) return 'vendor-mui';
            if (id.includes('xlsx')) return 'vendor-xlsx';
            if (id.includes('jspdf')) return 'vendor-pdf';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@tanstack/react-query')) return 'vendor-rq';
            if (id.includes('@tanstack/react-table')) return 'vendor-rt';
            if (id.includes('@tanstack')) return 'vendor-tanstack';
            if (id.includes('date-fns')) return 'vendor-datefns';
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('zod') || id.includes('react-hook-form') || id.includes('@hookform')) return 'vendor-forms';
            if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n';
            if (id.includes('@sentry')) return 'vendor-sentry';
            if (id.includes('semantic-ui') || id.includes('react-joyride') || id.includes('react-markdown')) return 'vendor-misc';
            if (id.includes('@dnd-kit') || id.includes('@hello-pangea') || id.includes('react-beautiful-dnd')) return 'vendor-dnd';
            if (id.includes('react-day-picker') || id.includes('embla-carousel')) return 'vendor-picker';
            return;
          }

          if (id.includes('/src/pages/septic/') || id.includes('/src/components/septic/')) return 'app-septic';
          if (id.includes('/src/pages/export/') || id.includes('/src/components/export/')) return 'app-export';
          if (id.includes('/src/pages/personal-trainer/') || id.includes('/src/components/personal-trainer/') || id.includes('/src/components/nutrition/')) return 'app-personal-trainer';
          if (id.includes('/src/pages/welding/') || id.includes('/src/components/welding/')) return 'app-welding';
          if (id.includes('/src/pages/game-development/') || id.includes('/src/components/game-development/')) return 'app-game-dev';
          if (id.includes('/src/pages/fuel-delivery/') || id.includes('/src/components/fuel-delivery/')) return 'app-fuel';
          if (id.includes('/src/pages/water-delivery/') || id.includes('/src/components/water-delivery/')) return 'app-water';
          if (id.includes('/src/pages/automotive/') || id.includes('/src/components/automotive/')) return 'app-automotive';
          if (id.includes('/src/pages/gunsmith/') || id.includes('/src/components/gunsmith/')) return 'app-gunsmith';
          if (id.includes('/src/components/landing/')) return 'app-landing';
        },
      },
    },
  },
}));
