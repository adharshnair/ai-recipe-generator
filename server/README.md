# Recipe API

The development API is mounted by the Vite plugin in `vite.config.ts`.

- `POST /api/generate-recipes`
- Request body: `{ "skillLevel": "Home Cook", "ingredients": ["eggs", "garlic"] }`
- Provider key: `OPENAI_API_KEY` in a local `.env` file

Copy `.env.example` to `.env` and add a provider key before using live model generation. The route contract and Zod output schema are implemented in the next backend phase.
