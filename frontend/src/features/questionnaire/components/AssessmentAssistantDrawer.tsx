type AssessmentAssistantDrawerProps = {
  isOpen: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
}

function AssessmentAssistantDrawer({
  isOpen,
  title = 'Tekstovna pomoč',
  onClose,
  children,
}: AssessmentAssistantDrawerProps) {
  if (!isOpen) {
    return null
  }

  return (
    <aside
      className="assessment-assistant-drawer"
      aria-label={title}
    >
      <div className="assessment-assistant-drawer__header">
        <span>{title}</span>

        <button
          type="button"
          className="assessment-assistant-drawer__close"
          onClick={onClose}
        >
          Zapri
        </button>
      </div>

      <div className="assessment-assistant-drawer__content">
        {children}
      </div>
    </aside>
  )
}

export default AssessmentAssistantDrawer