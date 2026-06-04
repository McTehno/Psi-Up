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
  nextLabel = 'Naslednjo â†’',
}: AssessmentActionsProps) {
  return (
    <div className="assessment-actions" role="group" aria-label="Navigacija vpraĹˇalnika">
      <button
        className="secondary-button"
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
      >
        â† PrejĹˇnjo
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

