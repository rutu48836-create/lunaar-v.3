
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    'import.meta.env.BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL || "https://lunaar-v-3.onrender.com")
  },
  build: {
    lib: {
      entry: 'src/widget/widget.js',
      name: 'LunaarWidget',
      formats: ['iife'],
      fileName: () => 'widget.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    minify: true,
  }
})