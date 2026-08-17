import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 🔥 Vite 6+ me saare hosts allow karne ka ekdum valid aur official tareeqa
    allowedHosts: true 
  }
})