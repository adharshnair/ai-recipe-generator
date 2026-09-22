/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleGenerateRecipes } from '../server/generate-recipes.js'

/**
 * Vercel serverless function for POST /api/generate-recipes.
 *
 * In local development this route is served by the ⁠ recipe-api ⁠ Vite plugin in
 * vite.config.ts. That plugin uses ⁠ configureServer ⁠, which only runs under
 * ⁠ vite dev ⁠, so production needs this function to answer the same route.
 *
 * Params are typed as the Node base types that Vercel's request and response
 * objects extend, which keeps this file free of extra dependencies.
 */
/**
 * Declared here rather than in vercel.json, whose ⁠ functions ⁠ glob fails the
 * build if the pattern does not match a detected function. The handler aborts
 * generation at 10s on its own, so this only buys headroom over the platform
 * default.
 */
export const config = { maxDuration: 30 }

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.statusCode = 405
    response.setHeader('Allow', 'POST')
    response.end(JSON.stringify({ error: 'Method not allowed.' }))
    return
  }

  const preParsedBody = (request as IncomingMessage & { body?: unknown }).body
  await handleGenerateRecipes(request, response, preParsedBody)
}