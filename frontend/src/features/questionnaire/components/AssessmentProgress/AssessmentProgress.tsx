import { useState, type CSSProperties } from 'react'
import './AssessmentProgress.css'

export type AssessmentProgressStepStatus =
  | 'completed'
  | 'active'
  | 'missing'
  | 'rejected'
  | 'upcoming'

export type AssessmentProgressQuestionStatus =
  | 'completed'
  | 'active'
  | 'rejected'
  | 'upcoming'

export type AssessmentProgressQuestion = {
  id: string
  status: AssessmentProgressQuestionStatus
}

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
  questionIds?: string[]
  variant?: 'module' | 'learning-unit'
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
  questions?: AssessmentProgressQuestion[]
}
type VisualQuestionSegment = {
  id: string
  status: AssessmentProgressQuestionStatus
  left: number
  width: number
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


function isResolvedQuestionStatus(status: AssessmentProgressQuestionStatus) {
  return status === 'completed' || status === 'rejected'
}

function getQuestionStatusById(questions: AssessmentProgressQuestion[]) {
  return new Map(questions.map((question) => [question.id, question.status]))
}

function getEvenStepPositionPercent(
  index: number,
  stepCount: number,
  showGoalFlag: boolean,
) {
  const questionAreaPercent = getQuestionAreaPercent(showGoalFlag)

  if (stepCount <= 0) {
    return 0
  }

  return ((index + 1) / stepCount) * questionAreaPercent
}
function buildVisualQuestionSegments({
  steps,
  questions,
  questionCount,
  showGoalFlag,
}: {
  steps: AssessmentProgressStep[]
  questions: AssessmentProgressQuestion[]
  questionCount: number
  showGoalFlag: boolean
}): VisualQuestionSegment[] {
  if (questionCount <= 0 || steps.length === 0) {
    return []
  }

  const questionStatusById = getQuestionStatusById(questions)
  const visualSegments: VisualQuestionSegment[] = []
  let previousStepPosition = 0

  steps.forEach((step, stepIndex) => {
    const stepPosition = getEvenStepPositionPercent(
      stepIndex,
      steps.length,
      showGoalFlag,
    )

    const segmentStart = previousStepPosition
    const segmentEnd = Math.max(segmentStart, stepPosition)
    const segmentWidth = segmentEnd - segmentStart
    const stepQuestionIds = step.questionIds ?? []

    if (segmentWidth <= 0 || stepQuestionIds.length === 0) {
      previousStepPosition = stepPosition
      return
    }

    const firstRejectedIndex = stepQuestionIds.findIndex(
      (questionId) => questionStatusById.get(questionId) === 'rejected',
    )

    const questionWidth = segmentWidth / stepQuestionIds.length

    stepQuestionIds.forEach((questionId, questionIndex) => {
      const questionStatus = questionStatusById.get(questionId) ?? 'upcoming'

      if (firstRejectedIndex !== -1 && questionIndex > firstRejectedIndex) {
        return
      }

      if (firstRejectedIndex !== -1 && questionIndex === firstRejectedIndex) {
        visualSegments.push({
          id: `${step.id}_${questionId}_rejected_remainder`,
          status: 'rejected',
          left: segmentStart + questionIndex * questionWidth,
          width: segmentEnd - (segmentStart + questionIndex * questionWidth),
        })

        return
      }

      if (questionStatus === 'completed') {
        visualSegments.push({
          id: `${step.id}_${questionId}_completed`,
          status: 'completed',
          left: segmentStart + questionIndex * questionWidth,
          width: questionWidth,
        })
      }

      if (questionStatus === 'rejected') {
        visualSegments.push({
          id: `${step.id}_${questionId}_rejected`,
          status: 'rejected',
          left: segmentStart + questionIndex * questionWidth,
          width: questionWidth,
        })
      }
    })

    previousStepPosition = stepPosition
  })

  return visualSegments
}

function getStepMarker(step: AssessmentProgressStep, index: number) {
  if (step.status === 'completed') {
    return '✓'
  }

  if (step.status === 'rejected') {
    return '✗'
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
  questions = [],
}: AssessmentProgressProps) {

  const [activeTooltipStepId, setActiveTooltipStepId] = useState<string | null>(
    null,
  )
  const safeQuestionCount = Math.max(questionCount ?? questions.length ?? 0, 0)

  const normalizedQuestions =
    questions.length === safeQuestionCount
      ? questions
      : Array.from({ length: safeQuestionCount }, (_, index) => ({
        id: `question_${index}`,
        status:
          index < confirmedQuestionCount
            ? ('completed' as const)
            : ('upcoming' as const),
      }))

  const resolvedQuestionCount = normalizedQuestions.filter((question) =>
    isResolvedQuestionStatus(question.status),
  ).length

  const safeConfirmedQuestionCount = Math.min(
    safeQuestionCount,
    Math.max(0, resolvedQuestionCount),
  )

  const areAllQuestionsCompleted =
    safeQuestionCount > 0 &&
    normalizedQuestions.every((question) => question.status === 'completed')

  const hasReachedVisualGoal = showGoalFlag && (isGoalReached || areAllQuestionsCompleted)

  const hasQuestionProgress = safeQuestionCount > 0


  const progressPercent = hasQuestionProgress
    ? getQuestionProgressPercent(
      safeConfirmedQuestionCount,
      safeQuestionCount,
      showGoalFlag,
      hasReachedVisualGoal,
    )
    : getProgressPercent(completedLeafCount, totalLeafCount)


  const visualQuestionSegments = hasQuestionProgress
    ? [
      ...buildVisualQuestionSegments({
        steps,
        questions: normalizedQuestions,
        questionCount: safeQuestionCount,
        showGoalFlag,
      }),
      ...(hasReachedVisualGoal
        ? [
          {
            id: 'goal_completed_segment',
            status: 'completed' as const,
            left: getQuestionAreaPercent(showGoalFlag),
            width: 100 - getQuestionAreaPercent(showGoalFlag),
          },
        ]
        : []),
    ]
    : []



  const progressLabel = hasQuestionProgress
    ? `${safeConfirmedQuestionCount}/${safeQuestionCount}`
    : `${completedLeafCount}/${totalLeafCount}`

  if (steps.length === 0) {
    return null
  }

  return (
    <section
      className={`assessment-progress${showGoalFlag ? ' assessment-progress--with-goal' : ''
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
          {hasQuestionProgress ? (
            <div
              className="assessment-progress__question-segments"
              aria-hidden="true"
            >
              {visualQuestionSegments.map((segment) => (
                <span
                  className={`assessment-progress__question-segment assessment-progress__question-segment--${segment.status}`}
                  key={segment.id}
                  style={
                    {
                      left: `${segment.left}%`,
                      width: `${segment.width}%`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          ) : (
            <div className="assessment-progress__fill" />
          )}
        </div>

        <div className="assessment-progress__steps">
          {steps.map((step, index) => {
            const isLabelBelow = index % 2 === 0

            return (
              <div
                className={`assessment-progress__step assessment-progress__step--${step.status} ${step.variant
                  ? `assessment-progress__step--${step.variant}`
                  : ''
                  } ${isLabelBelow
                    ? 'assessment-progress__step--label-bottom'
                    : 'assessment-progress__step--label-top'
                  }`}
                key={step.id}
                style={
                  {
                    left: `${getEvenStepPositionPercent(
                      index,
                      steps.length,
                      showGoalFlag,
                    )}%`,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className="assessment-progress__marker"
                  aria-label={step.title}
                  title={step.title}
                  onClick={() =>
                    setActiveTooltipStepId((currentStepId) =>
                      currentStepId === step.id ? null : step.id,
                    )
                  }
                >
                  {getStepMarker(step, index)}
                </button>
                <span
                  className={`assessment-progress__label ${isLabelBelow
                    ? 'assessment-progress__label--bottom'
                    : 'assessment-progress__label--top'
                    }`}
                >
                  {step.title}
                </span>
                <span
                  className={`assessment-progress__tooltip ${activeTooltipStepId === step.id
                    ? 'assessment-progress__tooltip--visible'
                    : ''
                    }`}
                  role="tooltip"
                >
                  {step.title}
                </span>

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
            )
          })}
        </div>

        {showGoalFlag && (
          <div
            className={`assessment-progress__flag ${hasReachedVisualGoal ? 'assessment-progress__flag--completed' : ''
              }`}
            aria-label={hasReachedVisualGoal ? 'Cilj dosežen' : 'Cilj'}
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

