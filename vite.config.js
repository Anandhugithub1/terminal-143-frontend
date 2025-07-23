import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  build: {
    // bump the warning threshold if you like:

    rollupOptions: {
      output: {
        manualChunks(id) {
          // anything from node_modules → vendor.js
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
