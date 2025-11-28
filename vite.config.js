import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext' // Explicitly support modern JS features like import.meta
  },
  esbuild: {
    target: 'esnext', // Ensures the dev server/optimizer also supports it
    supported: {
      'import-meta': true
    }
  }
})