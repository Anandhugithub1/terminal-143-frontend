import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_BUILD_ID__: JSON.stringify(0),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest-tests/setup.js'],
    globals: true,
    // Kept in a separate directory from tests/ (Playwright's testDir, all
    // *.spec.js) — Playwright's own test discovery otherwise picks up
    // *.test.js files too and fails trying to import Vitest's mock API.
    include: ['vitest-tests/**/*.test.{js,jsx}'],
  },
})
