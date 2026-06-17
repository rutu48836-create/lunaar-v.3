import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        widget: 'src/widget/widget.js', // second entry
      },
      output: {
        entryFileNames: (chunk) => {
          // Output widget as widget.js (no hash), app bundle gets hashed
          if (chunk.name === 'widget') return 'widget.js'
          return 'assets/[name]-[hash].js'
        },
        format: 'iife', // won't work cleanly with mixed entries — see note below
      }
    }
  }
})