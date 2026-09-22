/// <reference types="node" />

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { Output, streamText } from 'ai'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { recipeSchema, type Recipe } from '../src/data/recipe-schema.js'

type RecipeRequest = {
  skill?: string
  skillLevel?: string
  ingredients: string[]
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

function getGenerationError(error: unknown) {
  if (typeof error !== 'object' || error === null) return 'Recipe generation failed. Please try again.'

  const providerError = error as { statusCode?: number; message?: string; data?: { error?: { message?: string } } }
  const message = providerError.data?.error?.message ?? providerError.message ?? ''

  if (providerError.statusCode === 429 || message.includes('quota')) {
    const retryMatch = message.match(/retry in ([\d.]+)s/i)
    const retryMessage = retryMatch ? ` Try again in about ${Math.ceil(Number(retryMatch[1]))} seconds.` : ' Please check your Gemini API quota or billing plan.'
    return `Recipe generation quota exceeded.${retryMessage}`
  }

  return 'Recipe generation failed. Please try again.'
}

/**
 * Reads the JSON request body. Some hosts (notably the Vercel Node runtime)
 * consume the request stream and hand the handler an already-parsed body, so
 * prefer that when it is supplied and only fall back to reading the stream.
 */
async function readRecipeRequest(request: IncomingMessage, preParsedBody?: unknown): Promise<RecipeRequest> {
  if (typeof preParsedBody === 'string') return JSON.parse(preParsedBody) as RecipeRequest
  if (Buffer.isBuffer(preParsedBody)) return JSON.parse(preParsedBody.toString('utf8')) as RecipeRequest
  if (typeof preParsedBody === 'object' && preParsedBody !== null) return preParsedBody as RecipeRequest

  let body = ''
  for await (const chunk of request) body += chunk
  return JSON.parse(body) as RecipeRequest
}

/**
 * Core request handler, shared by the Vite dev middleware and the Vercel
 * serverless function in `api/generate-recipes.ts`. It does no routing of its
 * own so each host can decide how the route is matched.
 */
export async function handleGenerateRecipes(
  request: IncomingMessage,
  response: ServerResponse,
  preParsedBody?: unknown,
) {
  let input: RecipeRequest
  try {
    input = await readRecipeRequest(request, preParsedBody)
  } catch {
    response.statusCode = 400
    response.end(JSON.stringify({ error: 'Invalid recipe request.' }))
    return
  }

  const skill = formatSkillLevel(input.skillLevel ?? input.skill ?? '')
  if (!skill || !Array.isArray(input.ingredients) || input.ingredients.length === 0) {
    response.statusCode = 400
    response.end(JSON.stringify({ error: 'A cooking style and at least one ingredient are required.' }))
    return
  }

  response.statusCode = 200
  response.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
  response.setHeader('Cache-Control', 'no-cache, no-transform')
  response.setHeader('Connection', 'keep-alive')

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    writeChunk(response, { error: 'Recipe generation is unavailable because GOOGLE_GENERATIVE_AI_API_KEY is not configured.' })
    response.end()
    return
  }

  const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })
  const abortController = new AbortController()
  const abortTimer = setTimeout(() => abortController.abort(), 10000)
  const result = streamText({
    model: google(process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite'),
    maxRetries: 0,
    abortSignal: abortController.signal,
    output: Output.array({
      element: recipeSchema,
      minItems: 3,
      maxItems: 3,
      name: 'recipeResponse',
      description: 'Exactly three practical recipes ranked by ingredient match. Every ingredient must include a realistic quantity and every recipe must include complete steps.',
    }),
    system: `You are a precise recipe developer. The selected cook level controls the number and depth of the instructions. Lazy Amateur recipes must use 2 to 3 short, simple steps. Home Cook recipes must use 4 to 6 intermediate steps with useful details about preparation, heat, timing, and order. Pro Chef recipes must use 10 to 20 highly detailed steps with professional technique, temperatures, timing, sequencing, and sensory cues. Never collapse every recipe to the same generic three-step format. Every ingredient in ingredientsUsed and missingIngredients must have a realistic measured quantity. Every cooking step must also include measurements wherever an ingredient, liquid, seasoning, temperature, or time is used. Return strictly the requested structured recipe array.`,
    prompt: `Create exactly 3 recipes for a ${skill} cook using these exact kitchen ingredients: ${input.ingredients.join(', ')}. Follow the ${skill} step-count and detail rules exactly. Return all 3 complete recipes in the same response, including every recipe's steps. Use the supplied ingredients in ingredientsUsed, put pantry gaps in missingIngredients, and include exact quantity strings for every ingredient and measurement details in every step.`,
  })

  let streamedChunk = false
  let streamError: unknown
  const streamedRecipes: Recipe[] = []
  const streamPromise = (async () => {
    try {
      for await (const recipe of result.elementStream) {
        streamedChunk = true
        streamedRecipes.push(recipe)
        writeChunk(response, streamedRecipes)
      }
    } catch (error) {
      streamError = error
    }
  })()
  const timeoutPromise = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 10000))

  try {
    const outcome = await Promise.race([
      streamPromise.then(() => streamError ? 'error' as const : 'complete' as const),
      timeoutPromise,
    ])

    if (!streamedChunk) {
      writeChunk(response, { error: outcome === 'timeout' ? 'Recipe generation timed out. Please try again.' : getGenerationError(streamError) })
    } else if (outcome === 'error') {
      writeChunk(response, { error: getGenerationError(streamError) })
    }
  } finally {
    abortController.abort()
    clearTimeout(abortTimer)
    await streamPromise
  }

  response.end()
}

/**
 * Vite dev-server middleware adapter. Returns true when it has handled the
 * request so the middleware chain can stop.
 */
export async function generateRecipes(request: IncomingMessage, response: ServerResponse) {
  const pathname = request.url?.split('?')[0]
  if (request.method !== 'POST' || pathname !== '/api/generate-recipes') return false

  await handleGenerateRecipes(request, response)
  return true
}
