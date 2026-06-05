type AssessmentActionsProps = {
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
  nextLabel?: string
}

function AssessmentActions({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  nextLabel = 'Naslednjo → ',
}: AssessmentActionsProps) {
  return (
    <div className="assessment-actions" role="group" aria-label="Navigacija vprašalnika">
      <button
        className="secondary-button"
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
      >
        ← Prejšnjo
      </button>

      <button
        className="primary-button"
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
      >
        {nextLabel}
      </button>
    </div>
  )
}

export default AssessmentActions

