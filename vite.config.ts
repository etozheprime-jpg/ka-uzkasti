import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves from /<repo>/; set BASE_PATH in CI. Locally it stays '/'.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  // data-pipeline output must never trigger page reloads while developing
  server: { watch: { ignored: ['**/scripts/raw/**', '**/.claude/**'] } },
})
