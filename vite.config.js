import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: 'local.terminal143.com',
    strictPort: true,
    https: {
      key: './certs/local.terminal143.com-key.pem',
      cert: './certs/local.terminal143.com.pem',
    },
    port: 5173,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('@tanstack')) return 'tanstack'
          if (id.includes('i18next')) return 'i18n'
          if (id.includes('headlessui')) return 'headlessui'
          if (id.includes('react-icons')) return 'icons'
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('axios')) return 'axios'

          return 'vendor'
        },
      },
    },
  },
})
