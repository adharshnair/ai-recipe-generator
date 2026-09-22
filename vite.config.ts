import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Import it
import path from 'path' // Required for resolving aliases safely
import { generateRecipes } from './server/generate-recipes.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
  plugins: [
    react(),
    tailwindcss(), // 2. Add it here
    {
      name: 'recipe-api',
      // `configureServer` only runs under `vite dev`, and `configurePreviewServer`
      // only under `vite preview`, so both are registered. Production on Vercel is
      // served by the serverless function in api/generate-recipes.ts.
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (await generateRecipes(request, response)) return
          next()
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (await generateRecipes(request, response)) return
          next()
        })
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"), // 3. Maps `@` to your `src` folder
    },
  },
  }
})

