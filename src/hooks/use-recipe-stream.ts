import { useState } from 'react'
import type { Recipe } from '../data/recipe-schema'

type RecipeRequest = {
  skill: string
  ingredients: string[]
}

type PartialRecipe = Partial<Recipe> & { id?: string }

type RecipeStreamState = {
  recipes: PartialRecipe[]
  isLoading: boolean
  error: string | null
}

export function useRecipeStream() {
  const [state, setState] = useState<RecipeStreamState>({ recipes: [], isLoading: false, error: null })

  async function generate(request: RecipeRequest) {
    setState({ recipes: [], isLoading: true, error: null })

    try {
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (!response.ok || !response.body) throw new Error('Unable to start recipe generation.')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          const chunk = JSON.parse(line) as PartialRecipe[] | { error?: string }

          if (!Array.isArray(chunk)) {
            const message = chunk.error ?? 'Recipe generation failed.'
            setState((current) => ({ ...current, isLoading: false, error: message }))
            return
          }

          setState((current) => ({ ...current, recipes: chunk, error: null }))
        }

        if (done) break
      }

      setState((current) => ({ ...current, isLoading: false }))
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Recipe generation failed.',
      }))
    }
  }

  return { ...state, generate }
}
