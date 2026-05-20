import { useMemo, useState } from 'react'

type AssessmentResult = {
	summary: string
	start_module_id: string | null
	start_learning_unit_id: string | null
	skipped_modules: string[]
	skipped_learning_units: string[]
	recommended_next_modules: string[]
	recommended_next_learning_units: string[]
}

type ModuleDetail = {
	_id: string
	title: string
	short_description: string
	duration_min: number
	learning_units: {
		learning_unit_id: string
		order: number
		parallel_group: string | null
		is_required: boolean
		prerequisites: string[]
	}[]
	learning_unit_details: {
		_id: string
		title: string
		short_description: string
		duration_min: number
		keywords: string[]
		skills: string[]
	}[]
}

type AssessmentJourneyResultProps = {
	title: string
	result: AssessmentResult | null
	moduleDetail: ModuleDetail | null
}

type JourneyStepStatus = 'skipped' | 'current' | 'recommended' | 'upcoming'

type JourneyStep = {
	id: string
	number: number
	title: string
	description: string
	durationMin?: number
	skills: string[]
	status: JourneyStepStatus
	position: {
		left: string
		top: string
	}
}

function getStepPosition(index: number, total: number) {
	if (total <= 1) {
		return {
			left: '12%',
			top: '68%',
		}
	}

	const progress = index / (total - 1)

	const left = 9 + progress * 78

	const yPoints = [
		70,
		58,
		46,
		34,
		22,
		10,
	]

	const exactIndex = progress * (yPoints.length - 1)
	const lowerIndex = Math.floor(exactIndex)
	const upperIndex = Math.ceil(exactIndex)

	const lowerValue = yPoints[lowerIndex]
	const upperValue = yPoints[upperIndex]

	const localProgress = exactIndex - lowerIndex
	const top = lowerValue + (upperValue - lowerValue) * localProgress

	return {
		left: `${left}%`,
		top: `${top}%`,
	}
}

function getStatusLabel(status: JourneyStepStatus) {
	if (status === 'skipped') return 'Preskočeno'
	if (status === 'current') return 'Priporočeni začetek'
	if (status === 'recommended') return 'Priporočeno'
	return 'Naslednji korak'
}

function AssessmentJourneyResult({
	title,
	result,
	moduleDetail,
}: AssessmentJourneyResultProps) {
	const steps = useMemo<JourneyStep[]>(() => {
		if (!moduleDetail) {
			return []
		}

		const sortedUnits = [...moduleDetail.learning_units].sort(
			(a, b) => a.order - b.order,
		)

		return sortedUnits.map((unit, index) => {
			const detail = moduleDetail.learning_unit_details.find(
				(item) => item._id === unit.learning_unit_id,
			)

			const unitId = unit.learning_unit_id

			let status: JourneyStepStatus = 'upcoming'

			if (result?.skipped_learning_units.includes(unitId)) {
				status = 'skipped'
			}

			if (result?.recommended_next_learning_units.includes(unitId)) {
				status = 'recommended'
			}

			if (result?.start_learning_unit_id === unitId) {
				status = 'current'
			}

			return {
				id: unitId,
				number: index + 1,
				title: detail?.title ?? unitId,
				description: detail?.short_description ?? 'Opis ni na voljo.',
				durationMin: detail?.duration_min,
				skills: detail?.skills ?? [],
				status,
				position: getStepPosition(index, sortedUnits.length),
			}
		})
	}, [moduleDetail, result])

	const [selectedStepId, setSelectedStepId] = useState<string | null>(null)

	const selectedStep =
		steps.find((step) => step.id === selectedStepId) ??
		steps.find((step) => step.status === 'current') ??
		steps[0]

	const startPoint =
		result?.start_learning_unit_id ?? result?.start_module_id ?? 'Ni določeno'

	const skippedCount =
		(result?.skipped_learning_units.length ?? 0) +
		(result?.skipped_modules.length ?? 0)

	if (!moduleDetail || steps.length === 0 || !selectedStep) {
		return (
			<div className="assessment-journey">
				<p>Podrobnosti priporočene učne poti niso na voljo.</p>
			</div>
		)
	}

	return (
		<div className="assessment-journey">
			<div className="assessment-journey__eyebrow">
				Priporočena učna pot · {title}
			</div>

			<p className="assessment-journey__description">
				Na podlagi vaših odgovorov smo določili, katere učne enote lahko
				preskočite in kje je najbolj smiselno nadaljevati.
			</p>

			<div className="assessment-journey__stats">
				<div>
					<span>Začetek</span>
					<strong>{startPoint}</strong>
				</div>

				<div>
					<span>Preskočeno</span>
					<strong>{skippedCount} vsebin</strong>
				</div>

				<div>
					<span>Trajanje modula</span>
					<strong>{moduleDetail.duration_min} min</strong>
				</div>
			</div>

			<div className="assessment-journey__mountain">
				<svg
					className="assessment-journey__path"
					viewBox="0 0 1000 420"
					preserveAspectRatio="none"
				>
					<path
						d="M70 330 C150 280, 190 320, 250 255 S350 245, 400 190 S520 200, 570 140 S700 120, 760 75 S850 85, 910 45"
						fill="none"
						stroke="rgba(47, 74, 49, 0.58)"
						strokeWidth="4"
						strokeDasharray="12 12"
						strokeLinecap="round"
					/>
				</svg>

				{steps.map((step) => (
					<button
						key={step.id}
						type="button"
						className={`journey-step journey-step--${step.status} ${
							selectedStep.id === step.id ? 'journey-step--selected' : ''
						}`}
						style={step.position}
						onClick={() => setSelectedStepId(step.id)}
					>
						<span>{step.number}</span>
						<strong>{step.title}</strong>
						<p>
							{step.durationMin
								? `${step.durationMin} min`
								: step.description}
						</p>
					</button>
				))}
			</div>

			<div className="assessment-journey-detail">
				<div className="assessment-journey-detail__number">
					{selectedStep.number}
				</div>

				<div>
					<div
						className={`assessment-journey-detail__badge assessment-journey-detail__badge--${selectedStep.status}`}
					>
						{getStatusLabel(selectedStep.status)}
					</div>

					<h3>{selectedStep.title}</h3>
					<p>{selectedStep.description}</p>

					{selectedStep.durationMin && (
						<p>
							<strong>Predvideno trajanje:</strong>{' '}
							{selectedStep.durationMin} min
						</p>
					)}

					{selectedStep.skills.length > 0 && (
						<div className="assessment-journey-detail__skills">
							<strong>Spretnosti:</strong>

							<ul>
								{selectedStep.skills.map((skill) => (
									<li key={skill}>{skill}</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default AssessmentJourneyResult