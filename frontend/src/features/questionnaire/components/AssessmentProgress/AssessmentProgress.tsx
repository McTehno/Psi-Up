import type { CSSProperties } from 'react'
import './AssessmentProgress.css'

export type AssessmentProgressStepStatus =
  | 'completed'
  | 'active'
  | 'missing'
  | 'upcoming'

export type AssessmentProgressSubStep = {
  id: string
  title: string
  status: AssessmentProgressStepStatus
}

export type AssessmentProgressStep = {
  id: string
  label: string
  title: string
  status: AssessmentProgressStepStatus
  subSteps?: AssessmentProgressSubStep[]
}

type AssessmentProgressProps = {
  targetLabel: string
  steps: AssessmentProgressStep[]
  completedLeafCount: number
  totalLeafCount: number
  isGoalReached?: boolean
}

const confettiPieces = Array.from({ length: 18 }, (_, index) => index)

function getProgressPercent(completedLeafCount: number, totalLeafCount: number) {
  if (totalLeafCount <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, (completedLeafCount / totalLeafCount) * 100))
}

function getStepMarker(step: AssessmentProgressStep, index: number) {
  if (step.status === 'completed') {
    return '✓'
  }

  if (step.status === 'missing') {
    return '!'
  }

  return step.label || String(index + 1)
}

function AssessmentProgress({
  targetLabel,
  steps,
  completedLeafCount,
  totalLeafCount,
  isGoalReached = false,
}: AssessmentProgressProps) {
  const progressPercent = getProgressPercent(completedLeafCount, totalLeafCount)

  if (steps.length === 0) {
    return null
  }

  return (
    <section
      className={`assessment-progress ${
        isGoalReached ? 'assessment-progress--completed' : ''
      }`}
      aria-label={`Napredek do cilja: ${targetLabel}`}
      style={
        {
          '--assessment-progress': `${progressPercent}%`,
          '--assessment-step-count': steps.length,
        } as CSSProperties
      }
    >
      <div className="assessment-progress__meta">
        <span>Napredek do cilja</span>
        <strong>
          {completedLeafCount}/{totalLeafCount}
        </strong>
      </div>

      <div className="assessment-progress__track">
        <div className="assessment-progress__line">
          <div className="assessment-progress__fill" />
        </div>

        <div className="assessment-progress__steps">
          {steps.map((step, index) => (
            <div
              className={`assessment-progress__step assessment-progress__step--${step.status}`}
              key={step.id}
            >
              <span className="assessment-progress__marker">
                {getStepMarker(step, index)}
              </span>

              <span className="assessment-progress__label">{step.title}</span>

              {step.subSteps && step.subSteps.length > 0 && (
                <span className="assessment-progress__substeps">
                  {step.subSteps.map((subStep) => (
                    <span
                      className={`assessment-progress__substep assessment-progress__substep--${subStep.status}`}
                      key={subStep.id}
                      title={subStep.title}
                    />
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>

        <div
          className={`assessment-progress__flag ${
            isGoalReached ? 'assessment-progress__flag--completed' : ''
          }`}
          aria-label={isGoalReached ? 'Cilj dosežen' : 'Cilj'}
        >
          ⚑
        </div>
      </div>

      {isGoalReached && (
        <div className="assessment-progress__confetti" aria-hidden="true">
          {confettiPieces.map((piece) => (
            <span
              key={piece}
              style={
                {
                  '--confetti-left': `${(piece * 37) % 100}%`,
                  '--confetti-delay': `${piece * 0.06}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default AssessmentProgress