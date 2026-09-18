import { createOpenAI } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { recipeResponseSchema, type Recipe } from '../src/data/recipe-schema.ts'

type RecipeRequest = {
  skill: string
  ingredients: string[]
}

const fallbackRecipes: Recipe[] = [
  {
    id: 'pantry-glow-up',
    title: 'Golden Pantry Skillet',
    prepTime: '20 min',
    difficulty: 'Easy',
    matchScore: 96,
    summary: 'A fast, savory skillet that lets your everyday ingredients do the work.',
    ingredientsUsed: ['2 eggs', '2 cloves garlic', '1 cup cooked rice'],
    missingIngredients: ['1 tbsp soy sauce', '1 tsp sesame oil'],
    steps: ['Warm the rice in a hot skillet.', 'Add garlic and cook until fragrant.', 'Fold in the eggs and finish with soy sauce.'],
    chefTip: 'Let the rice sit undisturbed for a minute so the edges get crisp.',
  },
  {
    id: 'bright-tomato-pasta',
    title: 'Bright Tomato Pasta',
    prepTime: '25 min',
    difficulty: 'Easy',
    matchScore: 89,
    summary: 'Silky tomato pasta with a garlicky finish and plenty of weeknight energy.',
    ingredientsUsed: ['200 g pasta', '2 tomatoes', '2 cloves garlic'],
    missingIngredients: ['30 g parmesan', '2 tbsp olive oil'],
    steps: ['Boil the pasta until just tender.', 'Saute garlic and tomatoes until glossy.', 'Toss the pasta through the sauce and finish with parmesan.'],
    chefTip: 'Save a splash of pasta water to make the sauce cling.',
  },
  {
    id: 'green-herb-omelet',
    title: 'Green Herb Omelet',
    prepTime: '12 min',
    difficulty: 'Medium',
    matchScore: 82,
    summary: 'A soft, quick omelet built around whatever fresh greens are waiting nearby.',
    ingredientsUsed: ['3 eggs', '1 handful spinach', '1 clove garlic'],
    missingIngredients: ['1 tbsp butter', '30 g soft cheese'],
    steps: ['Wilt the spinach with garlic.', 'Whisk the eggs and pour them into the pan.', 'Fold gently around the greens and serve warm.'],
    chefTip: 'Pull the omelet from the heat while the center is still slightly glossy.',
  },
]

function writeChunk(response: ServerResponse, chunk: unknown) {
  response.write(`${JSON.stringify(chunk)}\n`)
}

async function streamFallback(response: ServerResponse, ingredients: string[]) {
  const selected = fallbackRecipes.map((recipe) => ({
    ...recipe,
    ingredientsUsed: recipe.ingredientsUsed.map((item) => item.replace(/\d+[^a-zA-Z]*/, ''))
      .map((item) => `${item.trim()} (${ingredients[0] ?? 'pantry staple'})`),
  }))

  for (let index = 1; index <= selected.length; index += 1) {
    writeChunk(response, selected.slice(0, index))
    await new Promise((resolve) => setTimeout(resolve, 180))
  }
}

export async function generateRecipes(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST' || request.url !== '/api/generate-recipes') return false

  let body = ''
  for await (const chunk of request) body += chunk

  let input: RecipeRequest
  try {
    input = JSON.parse(body) as RecipeRequest
  } catch {
    response.statusCode = 400
    response.end(JSON.stringify({ error: 'Invalid recipe request.' }))
    return true
  }

  if (!input.skill || !Array.isArray(input.ingredients) || input.ingredients.length === 0) {
    response.statusCode = 400
    response.end(JSON.stringify({ error: 'A cooking style and at least one ingredient are required.' }))
    return true
  }

  response.statusCode = 200
  response.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
  response.setHeader('Cache-Control', 'no-cache, no-transform')
  response.setHeader('Connection', 'keep-alive')

  if (!process.env.OPENAI_API_KEY) {
    await streamFallback(response, input.ingredients)
    response.end()
    return true
  }

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const result = streamObject({
    model: openai('gpt-4o-mini'),
    schema: recipeResponseSchema,
    schemaName: 'recipeResponse',
    schemaDescription: 'One to three practical recipes ranked by ingredient match.',
    prompt: `Create 1 to 3 recipes for a ${input.skill} cook using these kitchen ingredients: ${input.ingredients.join(', ')}. Include exact measurements in ingredientsUsed and missingIngredients. Keep steps concise and useful.`,
  })

  try {
    for await (const partialRecipes of result.partialObjectStream) writeChunk(response, partialRecipes)
  } catch {
    if (!response.headersSent) response.statusCode = 502
    writeChunk(response, { error: 'Recipe generation failed.' })
  }

  response.end()
  return true
}
