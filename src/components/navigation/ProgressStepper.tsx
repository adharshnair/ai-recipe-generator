const steps = ['Your style', 'Your ingredients', 'Your recipes', 'Make it']

type ProgressStepperProps = {
  activeStep?: number
}

export function ProgressStepper({ activeStep = 0 }: ProgressStepperProps) {
  return (
    <nav className="stepper" aria-label="Recipe generator steps">
      {steps.map((step, index) => (
        <div className={`step ${index === activeStep ? 'is-active' : ''} ${index < activeStep ? 'is-complete' : ''}`} key={step}>
          <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
          <span>{step}</span>
        </div>
      ))}
    </nav>
  )
}
