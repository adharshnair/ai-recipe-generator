import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { Output, streamText } from 'ai'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { recipeResponseSchema, type Recipe } from '../src/data/recipe-schema.ts'

type RecipeRequest = {
  skill?: string
  skillLevel?: string
  ingredients: string[]
}

function buildFallbackRecipes(ingredients: string[], skill: string): Recipe[] {
  const pantry = ingredients.map((item) => item.trim()).filter(Boolean)
  const used = pantry.slice(0, 4).map((item, index) => ({ item, quantity: index === 0 ? '1 cup' : '1 portion' }))
  const missing = [{ item: 'olive oil', quantity: '1 tbsp' }, { item: 'kosher salt', quantity: '1/2 tsp' }]
  const main = pantry[0] ?? 'pantry ingredients'

  return [
    {
      id: 'pantry-skillet', title: `${main} ${skill} skillet`, prepTime: '20 min', difficulty: 'Easy', matchScore: '100% match with your pantry',
      summary: `A practical skillet built around ${pantry.join(', ')}.`, ingredientsUsed: used, missingIngredients: missing,
      steps: [`Prep and portion the ${pantry.join(' and ')}.`, 'Warm a skillet over medium heat and add the oil.', 'Cook until browned, season, and serve hot.'], chefTip: 'Give each ingredient room in the pan so it browns instead of steaming.',
    },
    {
      id: 'pantry-bowl', title: `${main} comfort bowl`, prepTime: '25 min', difficulty: 'Easy', matchScore: '92% match with your pantry',
      summary: `A flexible bowl that makes ${main} the center of the meal.`, ingredientsUsed: used.slice(0, 3), missingIngredients: [{ item: 'lemon', quantity: '1/2' }],
      steps: [`Rinse and prepare the ${main} according to its texture.`, 'Layer the remaining ingredients in a warm bowl.', 'Finish with lemon, oil, and a final seasoning check.'], chefTip: 'Taste at the end and adjust salt after adding the bright finish.',
    },
    {
      id: 'pantry-stew', title: `One-pot ${main} dinner`, prepTime: '35 min', difficulty: skill === 'Pro Chef' ? 'Hard' : 'Medium', matchScore: '86% match with your pantry',
      summary: `A cozy one-pot approach for turning ${main} and your pantry into dinner.`, ingredientsUsed: used, missingIngredients: [{ item: 'vegetable stock', quantity: '2 cups' }],
      steps: ['Build a fragrant base in a heavy pot.', `Add the ${pantry.join(', ')} and stir to coat.`, 'Add stock, simmer gently, and serve when tender.'], chefTip: 'Keep the simmer gentle to concentrate flavor without drying the ingredients.',
    },
  ]
}

function formatSkillLevel(skill: string) {
  return ({
    'lazy-amateur': 'Lazy Amateur',
    'home-cook': 'Home Cook',
    'pro-chef': 'Pro Chef',
  } as Record<string, string>)[skill] ?? skill
}

function writeChunk(response: ServerResponse, chunk: unknown) {
  response.write(`${JSON.stringify(chunk)}\n`)
}

async function streamFallback(response: ServerResponse, ingredients: string[], skill: string) {
  const selected = buildFallbackRecipes(ingredients, skill)

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

  const skill = formatSkillLevel(input.skillLevel ?? input.skill ?? '')
  if (!skill || !Array.isArray(input.ingredients) || input.ingredients.length === 0) {
    response.statusCode = 400
    response.end(JSON.stringify({ error: 'A cooking style and at least one ingredient are required.' }))
    return true
  }

  response.statusCode = 200
  response.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
  response.setHeader('Cache-Control', 'no-cache, no-transform')
  response.setHeader('Connection', 'keep-alive')

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    await streamFallback(response, input.ingredients, skill)
    response.end()
    return true
  }

  const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })
  const abortController = new AbortController()
  const abortTimer = setTimeout(() => abortController.abort(), 10000)
  const result = streamText({
    model: google(process.env.GEMINI_MODEL ?? 'gemini-3.6-flash'),
    maxRetries: 0,
    abortSignal: abortController.signal,
    output: Output.object({
      schema: recipeResponseSchema,
      name: 'recipeResponse',
      description: 'One to three practical recipes ranked by ingredient match. Every ingredient must include a realistic quantity.',
    }),
    system: `You are a precise recipe developer. Adapt complexity to the cook skill level: Lazy Amateur means minimal steps, Home Cook means approachable prep, and Pro Chef means advanced techniques. Use only realistic measurements. Return strictly the requested structured recipe array.`,
    prompt: `Create 1 to 3 recipes for a ${skill} cook using these exact kitchen ingredients: ${input.ingredients.join(', ')}. Use the supplied ingredients in ingredientsUsed, put pantry gaps in missingIngredients, and include exact quantity strings for every ingredient.`,
  })

  let streamedChunk = false
  const streamPromise = (async () => {
    for await (const partialRecipes of result.partialOutputStream) {
      streamedChunk = true
      writeChunk(response, partialRecipes)
    }
  })()
  const timeoutPromise = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 10000))

  try {
    const outcome = await Promise.race([
      streamPromise.then(() => 'complete' as const).catch(() => 'error' as const),
      timeoutPromise,
    ])

    if (!streamedChunk) {
      abortController.abort()
      await streamFallback(response, input.ingredients, skill)
    } else if (outcome === 'error' && streamedChunk) {
      writeChunk(response, { error: 'Recipe generation was interrupted.' })
    }
  } finally {
    abortController.abort()
    clearTimeout(abortTimer)
    await streamPromise
  }

  response.end()
  return true
}
