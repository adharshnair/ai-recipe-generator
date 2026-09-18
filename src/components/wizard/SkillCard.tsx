import { motion } from 'motion/react'
import { Check, Clock3 } from 'lucide-react'
import type { SkillLevel } from '../../data/skill-levels'

type SkillCardProps = {
  skill: SkillLevel
  index: number
  selected: boolean
  onSelect: (skillId: string) => void
}

export function SkillCard({ skill, index, selected, onSelect }: SkillCardProps) {
  const Icon = skill.icon

  return (
    <motion.button
      className={`skill-card accent-${skill.accent} ${selected ? 'is-selected' : ''}`}
      type="button"
      onClick={() => onSelect(skill.id)}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 + index * 0.08 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.985 }}
      aria-pressed={selected}
    >
      <span className="card-topline">
        <span className="skill-icon"><Icon size={18} /></span>
        {selected && <span className="selected-mark"><Check size={13} /></span>}
      </span>
      <span className="skill-eyebrow">{skill.eyebrow}</span>
      <span className="skill-title">{skill.title}</span>
      <span className="skill-description">{skill.description}</span>
      <span className="skill-time"><Clock3 size={13} /> {skill.time}</span>
    </motion.button>
  )
}
