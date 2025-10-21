import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  // Add this section for local host + optional HTTPS
  server: {
    host: 'local.terminal143.com', // your custom host
    strictPort: true,               // fail if port is busy
    // Uncomment for HTTPS (required for SameSite=None cookies)
    // https: {
    //   key: './local.terminal143.com-key.pem',
    //   cert: './local.terminal143.com.pem'
    // }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
