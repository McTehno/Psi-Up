import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: true, // Omogoči dostop na 0.0.0.0 (za Docker)
    watch: {
      usePolling: true, // Obvezno za live-reload na Windowsu prek Docker volumnov
    },
  },
})
