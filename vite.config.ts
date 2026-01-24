import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Force cache clearing for development
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
    // Prevent duplicate React instances and reduce memory usage
    dedupe: ["react", "react-dom", "react/jsx-runtime", "xlsx"],
  },
  // Force rebuild dependencies to clear theme context cache
  optimizeDeps: {
    force: true,
  },
  build: {
    // Force new build hashes
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}));
