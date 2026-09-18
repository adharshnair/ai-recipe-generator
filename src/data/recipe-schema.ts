import { z } from 'zod'

export const recipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  prepTime: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  matchScore: z.string(),
  summary: z.string(),
  ingredientsUsed: z.array(z.object({ item: z.string(), quantity: z.string() })),
  missingIngredients: z.array(z.object({ item: z.string(), quantity: z.string() })),
  steps: z.array(z.string()),
  chefTip: z.string(),
})

export const recipeResponseSchema = z.array(recipeSchema).min(1).max(3)

export type Recipe = z.infer<typeof recipeSchema>
