import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: 'local.terminal143.com',
    strictPort: true,
   https: {
  key: './certs/local.terminal143.com-key.pem',
  cert: './certs/local.terminal143.com.pem'
} ,
    port: 5173,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
