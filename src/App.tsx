import { useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { SkillSelectionPage } from './pages/SkillSelectionPage'
import './App.css'

function App() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  return (
    <AppShell>
      <SkillSelectionPage
        selectedSkill={selectedSkill}
        onSkillSelect={setSelectedSkill}
        onContinue={() => undefined}
      />
    </AppShell>
  )
}

export default App
