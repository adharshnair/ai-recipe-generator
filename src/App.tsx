import { useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { ProgressStepper } from './components/navigation/ProgressStepper'
import { IngredientsPage } from './pages/IngredientsPage'
import { RecipesPage } from './pages/RecipesPage'
import { SkillSelectionPage } from './pages/SkillSelectionPage'
import { useRecipeStream } from './hooks/use-recipe-stream'
import './App.css'

function App() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const { recipes, isLoading, error, generate } = useRecipeStream()

  function addIngredient(ingredient: string) {
    setIngredients((current) => current.includes(ingredient) ? current : [...current, ingredient])
  }

  function removeIngredient(ingredient: string) {
    setIngredients((current) => current.filter((item) => item !== ingredient))
  }

  function handleGenerate() {
    if (!selectedSkill || ingredients.length === 0) return
    setCurrentStep(2)
    void generate({ skill: selectedSkill, ingredients })
  }

  return (
    <AppShell headerContent={<ProgressStepper activeStep={currentStep} />}>
      {currentStep === 0 && (
        <SkillSelectionPage
          selectedSkill={selectedSkill}
          onSkillSelect={setSelectedSkill}
          onContinue={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 1 && selectedSkill && (
        <IngredientsPage
          selectedSkill={selectedSkill}
          ingredients={ingredients}
          onAddIngredient={addIngredient}
          onRemoveIngredient={removeIngredient}
          onBack={() => setCurrentStep(0)}
          onGenerate={handleGenerate}
          isGenerating={false}
        />
      )}
      {currentStep === 2 && (
        <RecipesPage
          recipes={recipes}
          isLoading={isLoading}
          error={error}
          onBack={() => setCurrentStep(1)}
        />
      )}
    </AppShell>
  )
}

export default App
