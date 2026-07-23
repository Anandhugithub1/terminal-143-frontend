import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: 'local.passormatch.com',
    strictPort: true,
    https: {
      key: './certs/local.passormatch.com-key.pem',
      cert: './certs/local.passormatch.com.pem',
    },
    port: 5173,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // React must load before any chunk that touches React APIs at
          // module scope (createContext, etc.), so it gets its own chunk
          // instead of falling into 'vendor' where load order isn't guaranteed.
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react-vendor'

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
