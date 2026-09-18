import { useEffect } from 'react'
import { ChefHat, Clock3, X } from 'lucide-react'
import type { Recipe } from '../../data/recipe-schema'

type RecipeDetailsDialogProps = {
  recipe: Partial<Recipe> | null
  onClose: () => void
}

export function RecipeDetailsDialog({ recipe, onClose }: RecipeDetailsDialogProps) {
  useEffect(() => {
    if (!recipe) return undefined

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, recipe])

  if (!recipe) return null

  return (
    <div className="recipe-dialog-layer" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="recipe-dialog" role="dialog" aria-modal="true" aria-labelledby="recipe-dialog-title">
        <div className="recipe-dialog-header">
          <div>
            <span className="recipe-dialog-kicker"><ChefHat size={13} /> recipe details</span>
            <h2 id="recipe-dialog-title">{recipe.title ?? 'Recipe details'}</h2>
            <p>{recipe.summary ?? 'A recipe shaped around your kitchen.'}</p>
          </div>
          <button className="recipe-dialog-close" type="button" onClick={onClose} aria-label="Close recipe details">
            <X size={18} />
          </button>
        </div>

        <div className="recipe-dialog-meta">
          <span><Clock3 size={14} /> {recipe.prepTime ?? 'Time varies'}</span>
          <span>{recipe.difficulty ?? 'Flexible'} technique</span>
          <span>{recipe.matchScore ?? '--'}% pantry match</span>
        </div>

        <div className="recipe-dialog-body">
          <div className="recipe-dialog-column">
            <div className="recipe-dialog-section">
              <h3>In your kitchen</h3>
              <ul className="measurement-list">
                {(recipe.ingredientsUsed ?? []).map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
              </ul>
            </div>
            <div className="recipe-dialog-section missing-section">
              <h3>Pick up first</h3>
              <ul className="measurement-list">
                {(recipe.missingIngredients ?? []).map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
              </ul>
            </div>
          </div>

          <div className="recipe-dialog-section steps-section">
            <h3>How to make it</h3>
            <ol className="recipe-steps">
              {(recipe.steps ?? []).map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {recipe.chefTip && (
          <div className="chef-tip"><span>Chef tip</span><p>{recipe.chefTip}</p></div>
        )}
      </section>
    </div>
  )
}
