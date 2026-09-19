import { motion } from 'motion/react'
import { Fragment } from 'react'

const steps = ['Your style', 'Your ingredients', 'Your recipes']

type ProgressStepperProps = {
  activeStep?: number
}

export function ProgressStepper({ activeStep = 0 }: ProgressStepperProps) {
  return (
    <nav className="stepper" aria-label="Recipe generator steps">
      {steps.map((step, index) => (
        <Fragment key={step}>
          <motion.div
            className={`step ${index === activeStep ? 'is-active' : ''} ${index < activeStep ? 'is-complete' : ''}`}
            layout
            transition={{ type: 'spring', stiffness: 360, damping: 28, mass: 0.8 }}
          >
            <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
            <span>{step}</span>
          </motion.div>
          {index < steps.length - 1 && <motion.span
            className={`progress-connector ${index < activeStep ? 'is-complete' : ''}`}
            aria-hidden="true"
            layout
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          />}
        </Fragment>
      ))}
    </nav>
  )
}
