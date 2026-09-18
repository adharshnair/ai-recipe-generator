import { X } from 'lucide-react'
import { motion } from 'motion/react'

type IngredientTagProps = {
  ingredient: string
  onRemove: () => void
}

export function IngredientTag({ ingredient, onRemove }: IngredientTagProps) {
  return (
    <motion.li
      className="ingredient-tag"
      layout
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <span>{ingredient}</span>
      <button type="button" onClick={onRemove} aria-label={`Remove ${ingredient}`}>
        <X size={13} />
      </button>
    </motion.li>
  )
}
