import { motion } from 'motion/react'
import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react'
import { RecipeCard } from '../components/recipe/RecipeCard'
import { RecipeDetailsDialog } from '../components/recipe/RecipeDetailsDialog'
import type { Recipe } from '../data/recipe-schema'
import { useState } from 'react'

type RecipesPageProps = {
  recipes: Array<Partial<Recipe>>
  isLoading: boolean
  error: string | null
  onBack: () => void
}

export function RecipesPage({ recipes, isLoading, error, onBack }: RecipesPageProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Partial<Recipe> | null>(null)

  return (
    <section className="wizard recipes-page" aria-labelledby="recipes-title">
      <div className="intro recipes-intro">
        <motion.div className="intro-kicker" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="kicker-line" /> step three of four
        </motion.div>
        <motion.h1 id="recipes-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
          Your next meal, <em>assembled.</em>
        </motion.h1>
        <motion.p className="intro-copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.16 }}>
          A few ideas shaped around what you already have. The good part is about to begin.
        </motion.p>
      </div>

      {error && <div className="recipe-error"><AlertCircle size={16} /> {error}</div>}

      {isLoading && recipes.length === 0 && (
        <div className="recipe-loading" role="status"><span className="loading-orbit"><Sparkles size={16} /></span> Reading your pantry...</div>
      )}

      {recipes.length > 0 && (
        <div className={`recipe-grid recipe-grid-${Math.min(recipes.length, 3)}`}>
          {recipes.map((recipe, index) => <RecipeCard key={recipe.id ?? index} recipe={recipe} index={index} onOpen={() => setSelectedRecipe(recipe)} />)}
        </div>
      )}

      <div className="wizard-footer recipes-footer">
        <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={16} /> Adjust ingredients</button>
        {isLoading && <span className="stream-status"><span /> streaming ideas</span>}
      </div>

      <RecipeDetailsDialog recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    </section>
  )
}
