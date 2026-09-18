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
          <div className={`step ${index === activeStep ? 'is-active' : ''} ${index < activeStep ? 'is-complete' : ''}`}>
            <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
            <span>{step}</span>
          </div>
          {index < steps.length - 1 && <span className={`progress-connector ${index < activeStep ? 'is-complete' : ''}`} aria-hidden="true" />}
        </Fragment>
      ))}
    </nav>
  )
}
