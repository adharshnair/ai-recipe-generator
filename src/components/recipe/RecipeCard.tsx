import { motion } from 'motion/react'
import { ArrowUpRight, Clock3, CircleAlert, Sparkles } from 'lucide-react'
import type { Recipe } from '../../data/recipe-schema'

type RecipeCardProps = {
  recipe: Partial<Recipe>
  index: number
}

export function RecipeCard({ recipe, index }: RecipeCardProps) {
  return (
    <motion.article
      className="recipe-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="recipe-card-topline">
        <span className="recipe-match"><Sparkles size={12} /> {recipe.matchScore ?? '--'}% match</span>
        <button className="recipe-open" type="button" aria-label={`Open ${recipe.title ?? 'recipe'}`}>
          <ArrowUpRight size={16} />
        </button>
      </div>
      <h2>{recipe.title ?? 'Finding a recipe...'}</h2>
      <p className="recipe-summary">{recipe.summary ?? 'Building a recipe from your ingredients.'}</p>
      <div className="recipe-meta">
        <span><Clock3 size={13} /> {recipe.prepTime ?? 'calculating'}</span>
        <span>{recipe.difficulty ?? 'Flexible'}</span>
      </div>
      <div className="recipe-ingredients">
        {recipe.ingredientsUsed?.slice(0, 3).map((ingredient) => <span key={ingredient}>{ingredient}</span>)}
        {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
          <span className="missing-ingredient"><CircleAlert size={12} /> {recipe.missingIngredients.length} to get</span>
        )}
      </div>
    </motion.article>
  )
}
