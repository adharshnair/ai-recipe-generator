import { Clock3, Flame, WandSparkles, type LucideIcon } from 'lucide-react'

export type SkillLevel = {
  id: string
  eyebrow: string
  title: string
  description: string
  time: string
  icon: LucideIcon
  accent: 'mint' | 'gold' | 'coral'
}

export const skillLevels: SkillLevel[] = [
  {
    id: 'lazy-amateur',
    eyebrow: '01 / low lift',
    title: 'Lazy Amateur',
    description: 'Minimal effort, maximum comfort. Keep it quick and uncomplicated.',
    time: 'Under 15 min',
    icon: Clock3,
    accent: 'mint',
  },
  {
    id: 'home-cook',
    eyebrow: '02 / everyday',
    title: 'Home Cook',
    description: 'A little prep, a little timing. The sweet spot for most weeknights.',
    time: '15–35 min',
    icon: Flame,
    accent: 'gold',
  },
  {
    id: 'pro-chef',
    eyebrow: '03 / ambitious',
    title: 'Pro Chef',
    description: 'Complex techniques, bold flavors, and room to make something memorable.',
    time: '35+ min',
    icon: WandSparkles,
    accent: 'coral',
  },
]
