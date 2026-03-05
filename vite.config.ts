import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  // GitHub Pages serves production builds from /<repo>/, while local dev runs at /.
  base: mode === 'production' ? '/sudoku-4all/' : '/',
  plugins: [react(), tailwindcss()],
}))
