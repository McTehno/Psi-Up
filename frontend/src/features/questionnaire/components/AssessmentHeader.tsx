import { VoiceHelpButton } from "../../../components/voice-help/VoiceHelpButton"

type AssessmentQuestion = {
  id: string | number
  learning_unit_id?: string | number | null
  question: string
}

type AssessmentHeaderProps = {
  label: string
  currentQuestion?: AssessmentQuestion | null
  onVoiceSupportClick?: () => void
  isVoiceSupportDisabled?: boolean
}

function AssessmentHeader({
  label,
  currentQuestion,
  onVoiceSupportClick,
  isVoiceSupportDisabled = false,
}: AssessmentHeaderProps) {
  const hasQuestionForVoiceHelp =
    Boolean(currentQuestion?.id) && Boolean(currentQuestion?.question)

  const shouldRenderGeneratedVoiceHelp =
    hasQuestionForVoiceHelp && !isVoiceSupportDisabled

  return (
    <header className="assessment-header">
      <div className="assessment-step">
        <span className="assessment-step__icon">ⓘ</span>

        <div className="assessment-step__content">
          <span>{label}</span>
        </div>
      </div>

      {shouldRenderGeneratedVoiceHelp && currentQuestion ? (
        <VoiceHelpButton
          className="assessment-header__voice-help"
          targetType="learning_unit"
          targetId={String(
            currentQuestion.learning_unit_id ?? currentQuestion.id
          )}
          questionId={String(currentQuestion.id)}
          questionText={currentQuestion.question}
          answerOptions={["Da", "Ne"]}
        />
      ) : (
        <button
          type="button"
          className="assessment-header__voice-help assessment-header__voice-help--disabled"
          onClick={onVoiceSupportClick}
          disabled={isVoiceSupportDisabled}
        >
          Glasovna pomoč
        </button>
      )}
    </header>
  )
}

export default AssessmentHeader