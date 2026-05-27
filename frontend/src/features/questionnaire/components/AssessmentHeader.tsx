import { Volume2 } from 'lucide-react';

type AssessmentHeaderProps = {
  stepNumber: number
  totalSteps: number
  label: string
  onVoiceSupportClick?: () => void
  isVoiceSupportDisabled?: boolean
}

function AssessmentHeader({
  stepNumber,
  totalSteps,
  label,
  onVoiceSupportClick,
  isVoiceSupportDisabled = false,
}: AssessmentHeaderProps) {
  return (
    <header className="assessment-header">
      <div className="assessment-step">
        <span className="assessment-step__icon">ⓘ</span>
        <span>{label}</span>
      </div>
		
		<button
		className="listen-button"
		type="button"
		onClick={onVoiceSupportClick}
		disabled={isVoiceSupportDisabled}
		title={
			isVoiceSupportDisabled
			? 'Glasovna pomoč bo povezana z Azure voice podporo v naslednjem koraku.'
			: undefined
		}
		>
		<span className="listen-button__content">
			<Volume2 size={20} className="volume2" />
			<span>Glasovna pomoč</span>
		</span>
		</button>
    </header>
  )
}

export default AssessmentHeader