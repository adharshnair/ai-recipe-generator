import { useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { ProgressStepper } from './components/navigation/ProgressStepper'
import { IngredientsPage } from './pages/IngredientsPage'
import { SkillSelectionPage } from './pages/SkillSelectionPage'
import './App.css'

function App() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  function addIngredient(ingredient: string) {
    setIngredients((current) => current.includes(ingredient) ? current : [...current, ingredient])
  }

  function removeIngredient(ingredient: string) {
    setIngredients((current) => current.filter((item) => item !== ingredient))
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
          onGenerate={() => setIsGenerating(true)}
          isGenerating={isGenerating}
        />
      )}
    </AppShell>
  )
}

export default App
