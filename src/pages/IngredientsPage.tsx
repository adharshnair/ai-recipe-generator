import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Plus, Sparkles } from 'lucide-react'
import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { IngredientTag } from '../components/wizard/IngredientTag'

const suggestedIngredients = ['Eggs', 'Garlic', 'Onion', 'Rice', 'Pasta', 'Tomatoes', 'Chicken', 'Spinach']

type IngredientsPageProps = {
  selectedSkill: string
  ingredients: string[]
  onAddIngredient: (ingredient: string) => void
  onRemoveIngredient: (ingredient: string) => void
  onBack: () => void
  onGenerate: () => void
  isGenerating: boolean
}

export function IngredientsPage({
  selectedSkill,
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onBack,
  onGenerate,
  isGenerating,
}: IngredientsPageProps) {
  const [input, setInput] = useState('')

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && ingredients.length > 0) {
      event.preventDefault()
      onGenerate()
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const ingredient = input.trim()

    if (!ingredient) return

    onAddIngredient(ingredient)
    setInput('')
  }

  return (
    <section className="wizard ingredients-page" aria-labelledby="ingredients-title">
      <div className="intro ingredients-intro">
        <motion.div className="intro-kicker" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="kicker-line" /> step two of four
        </motion.div>
        <motion.h1 id="ingredients-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
          What’s in your kitchen?
        </motion.h1>
        <motion.p className="intro-copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.16 }}>
          Tell us what you have on hand. We’ll turn the ordinary into something worth making.
        </motion.p>
      </div>

      <motion.div className="ingredient-console" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.16 }}>
        <form className="ingredient-form" onSubmit={handleSubmit}>
          <Plus className="command-icon" size={18} />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add an ingredient..."
            aria-label="Add an ingredient"
            autoComplete="off"
            autoFocus
          />
          <span className="input-shortcut"><kbd>↵</kbd> add <kbd>⌘</kbd><kbd>↵</kbd> generate</span>
        </form>

        <div className="ingredient-divider" />

        <div className="ingredient-suggestions" aria-label="Suggested ingredients">
          <span className="suggestions-label">Quick add</span>
          <div className="suggestions-list">
            {suggestedIngredients.map((ingredient) => {
              const isAdded = ingredients.includes(ingredient)

              return (
                <button
                  className="suggestion-button"
                  key={ingredient}
                  type="button"
                  disabled={isAdded}
                  onClick={() => onAddIngredient(ingredient)}
                >
                  <Plus size={12} /> {ingredient}
                </button>
              )
            })}
          </div>
        </div>

        <div className="ingredient-list-wrap">
          {ingredients.length > 0 ? (
            <ul className="ingredient-list" aria-label="Your ingredients">
              <AnimatePresence mode="popLayout" initial={false}>
                {ingredients.map((ingredient) => (
                  <IngredientTag key={ingredient} ingredient={ingredient} onRemove={() => onRemoveIngredient(ingredient)} />
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className="ingredient-empty"><Plus size={15} /> Ingredients will appear here</div>
          )}
        </div>
      </motion.div>

      <div className="ingredient-note"><Sparkles size={14} /> Your <strong>{selectedSkill.replace('-', ' ')}</strong> cooking style is ready.</div>

      <div className="wizard-footer ingredients-footer">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <motion.button
          className="continue-button generate-button"
          type="button"
          disabled={ingredients.length === 0 || isGenerating}
          onClick={onGenerate}
          whileHover={ingredients.length > 0 ? { scale: 1.02 } : undefined}
          whileTap={ingredients.length > 0 ? { scale: 0.98 } : undefined}
        >
          {isGenerating ? 'Preparing recipes...' : 'Generate recipes'} {!isGenerating && <ArrowRight size={16} />}
        </motion.button>
      </div>
    </section>
  )
}
