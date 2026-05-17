type AssessmentHeaderProps = {
	stepNumber: number
	totalSteps: number
	label: string
	isAudioPlaying: boolean
	onToggleAudio: () => void
	hasAudio?: boolean
}

function AssessmentHeader({
	stepNumber,
	totalSteps,
	label,
	isAudioPlaying,
	onToggleAudio,
	hasAudio = true,
}: AssessmentHeaderProps) {
	return (
		<header className="assessment-header">
			<div className="assessment-step">
				<span className="assessment-step__icon">◌</span>
				<span>
					Korak {stepNumber} od {totalSteps}
				</span>
				<span>•</span>
				<span>{label}</span>
			</div>

			<button
				className="listen-button"
				type="button"
				onClick={onToggleAudio}
				disabled={!hasAudio}
			>
				{isAudioPlaying ? '⏹ Ustavi' : '🔊 Poslušaj vprašanje'}
			</button>
		</header>
	)
}

export default AssessmentHeader