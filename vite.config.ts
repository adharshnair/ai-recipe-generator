import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Import it
import path from 'path' // Required for resolving aliases safely

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Add it here
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 3. Maps `@` to your `src` folder
    },
  },
})
