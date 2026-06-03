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
  questionCountUntilStep?: number
}

type AssessmentProgressProps = {
  targetLabel: string
  steps: AssessmentProgressStep[]
  completedLeafCount: number
  totalLeafCount: number
  isGoalReached?: boolean
  questionCount?: number
  confirmedQuestionCount?: number
  showGoalFlag?: boolean
}

const confettiPieces = Array.from({ length: 18 }, (_, index) => index)

const GOAL_PROGRESS_AREA_PERCENT = 80

function getProgressPercent(completedLeafCount: number, totalLeafCount: number) {
  if (totalLeafCount <= 0) {
    return 0
  }

  return Math.min(
    100,
    Math.max(0, (completedLeafCount / totalLeafCount) * 100),
  )
}

function getQuestionAreaPercent(showGoalFlag: boolean) {
  return showGoalFlag ? GOAL_PROGRESS_AREA_PERCENT : 100
}

function getQuestionProgressPercent(
  confirmedQuestionCount: number,
  questionCount: number,
  showGoalFlag: boolean,
  isGoalReached: boolean,
) {
  if (questionCount <= 0) {
    return 0
  }

  if (showGoalFlag && isGoalReached) {
    return 100
  }

  const questionAreaPercent = getQuestionAreaPercent(showGoalFlag)

  return Math.min(
    questionAreaPercent,
    Math.max(0, (confirmedQuestionCount / questionCount) * questionAreaPercent),
  )
}

function getQuestionDotPercent(
  index: number,
  questionCount: number,
  showGoalFlag: boolean,
) {
  if (questionCount <= 0) {
    return 0
  }

  const questionAreaPercent = getQuestionAreaPercent(showGoalFlag)

  return ((index + 1) / questionCount) * questionAreaPercent
}

function getStepPositionPercent(
  step: AssessmentProgressStep,
  index: number,
  stepCount: number,
  questionCount: number,
  showGoalFlag: boolean,
) {
  const questionAreaPercent = getQuestionAreaPercent(showGoalFlag)

  if (
    questionCount > 0 &&
    typeof step.questionCountUntilStep === 'number'
  ) {
    return Math.min(
      questionAreaPercent,
      Math.max(
        0,
        (step.questionCountUntilStep / questionCount) * questionAreaPercent,
      ),
    )
  }

  if (stepCount <= 0) {
    return 0
  }

  return ((index + 1) / stepCount) * questionAreaPercent
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
  questionCount,
  confirmedQuestionCount = 0,
  showGoalFlag = false,
}: AssessmentProgressProps) {
  const safeQuestionCount = Math.max(questionCount ?? 0, 0)
  const safeConfirmedQuestionCount = Math.min(
    safeQuestionCount,
    Math.max(0, confirmedQuestionCount),
  )

  const hasQuestionProgress = safeQuestionCount > 0

  const progressPercent = hasQuestionProgress
    ? getQuestionProgressPercent(
        safeConfirmedQuestionCount,
        safeQuestionCount,
        showGoalFlag,
        isGoalReached,
      )
    : getProgressPercent(completedLeafCount, totalLeafCount)

  const progressLabel = hasQuestionProgress
    ? `${safeConfirmedQuestionCount}/${safeQuestionCount}`
    : `${completedLeafCount}/${totalLeafCount}`

  const questionDots = Array.from(
    { length: safeQuestionCount },
    (_, index) => index,
  )

  if (steps.length === 0) {
    return null
  }

  return (
    <section
      className={`assessment-progress${
        showGoalFlag ? ' assessment-progress--with-goal' : ''
      }`}
      aria-label={`Napredek do cilja ${targetLabel}`}
      style={
        {
          '--assessment-progress': `${progressPercent}%`,
        } as CSSProperties
      }
    >
      <div className="assessment-progress__meta">
        <span>Napredek do cilja</span>
        <strong>{progressLabel}</strong>
      </div>

      <div className="assessment-progress__track">
        <div className="assessment-progress__line">
          <div className="assessment-progress__fill" />

          {hasQuestionProgress && (
            <div
              className="assessment-progress__question-dots"
              aria-hidden="true"
            >
              {questionDots.map((dotIndex) => (
                <span
                  className={`assessment-progress__question-dot ${
                    dotIndex < safeConfirmedQuestionCount
                      ? 'assessment-progress__question-dot--completed'
                      : 'assessment-progress__question-dot--upcoming'
                  }`}
                  key={dotIndex}
                  style={
                    {
                      left: `${getQuestionDotPercent(
                        dotIndex,
                        safeQuestionCount,
                        showGoalFlag,
                      )}%`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div className="assessment-progress__steps">
          {steps.map((step, index) => (
            <div
              className={`assessment-progress__step assessment-progress__step--${step.status}`}
              key={step.id}
              style={
                {
                  left: `${getStepPositionPercent(
                    step,
                    index,
                    steps.length,
                    safeQuestionCount,
                    showGoalFlag,
                  )}%`,
                } as CSSProperties
              }
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

        {showGoalFlag && (
          <div
            className={`assessment-progress__flag ${
              isGoalReached ? 'assessment-progress__flag--completed' : ''
            }`}
            aria-label={isGoalReached ? 'Cilj dosežen' : 'Cilj'}
          >
            ⚑
          </div>
        )}

        {isGoalReached && (
          <div className="assessment-progress__confetti" aria-hidden="true">
            {confettiPieces.map((piece) => (
              <span
                key={piece}
                style={
                  {
                    '--confetti-left': `${10 + ((piece * 47) % 80)}%`,
                    '--confetti-delay': `${(piece % 6) * 45}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default AssessmentProgress