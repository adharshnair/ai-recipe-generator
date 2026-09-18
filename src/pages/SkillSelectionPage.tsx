import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { SkillCard } from '../components/wizard/SkillCard'
import { skillLevels } from '../data/skill-levels'

type SkillSelectionPageProps = {
  selectedSkill: string | null
  onSkillSelect: (skillId: string) => void
  onContinue: () => void
}

export function SkillSelectionPage({ selectedSkill, onSkillSelect, onContinue }: SkillSelectionPageProps) {
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && selectedSkill) {
        event.preventDefault()
        onContinue()
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [onContinue, selectedSkill])

  return (
    <section className="wizard" aria-labelledby="page-title">
      <div className="intro">
        <motion.div className="intro-kicker" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="kicker-line" /> step one of four
        </motion.div>
        <motion.h1 id="page-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
          How do you like to cook?
        </motion.h1>
        <motion.p className="intro-copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.16 }}>
          Set the pace. We’ll shape every recipe around your kind of kitchen energy.
        </motion.p>
      </div>

      <div className="skill-grid">
        {skillLevels.map((skill, index) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            index={index}
            selected={selectedSkill === skill.id}
            onSelect={onSkillSelect}
          />
        ))}
      </div>

      <div className="wizard-footer">
        <span className="footer-hint"><kbd>⌘</kbd><kbd>↵</kbd> to continue</span>
        <motion.button
          className="continue-button"
          type="button"
          disabled={!selectedSkill}
          onClick={onContinue}
          whileHover={selectedSkill ? { scale: 1.02 } : undefined}
          whileTap={selectedSkill ? { scale: 0.98 } : undefined}
        >
          Continue <ArrowRight size={16} />
        </motion.button>
      </div>
    </section>
  )
}
