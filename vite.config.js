import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: 'localhost',
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      // Forward /api calls to live Vercel deployment for local testing
      '/api': {
        target: 'https://ebookvala-lts4-black.vercel.app',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('framer-motion')) return 'framer';
            return 'vendor';
          }
        }
      }
    }
  }
})
