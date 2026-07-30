import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  define: {
    // Bakes the build time into the bundle so i18next can cache-bust its
    // translation JSON requests per-deploy — those files are fetched at
    // runtime via i18next-http-backend, not hashed like JS/CSS assets, so
    // mobile browsers were holding onto pre-deploy copies indefinitely.
    __APP_BUILD_ID__: JSON.stringify(Date.now()),
  },

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
        // Splitting React-dependent libraries (i18n, headlessui, motion, ...)
        // into separate manual chunks let some of them be reached only
        // through a lazy route's dynamic import(), while React itself was
        // still eagerly modulepreloaded from index.html — two different
        // loading paths for the same shared chunk, which could execute a
        // dependent chunk's top-level code (e.g. react-i18next's
        // createContext()) before React had finished loading. Let Rollup's
        // automatic chunking handle this instead; it tracks static vs.
        // dynamic import graphs correctly on its own.
      },
    },
  },
})
