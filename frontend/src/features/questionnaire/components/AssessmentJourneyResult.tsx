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

type JourneyPoint = {
	left: number
	top: number
}

type JourneyStep = {
	id: string
	number: number
	title: string
	description: string
	durationMin?: number
	skills: string[]
	status: JourneyStepStatus
	position: JourneyPoint
}

const JOURNEY_ROUTE_POINTS: JourneyPoint[] = [
	{ left: 6, top: 90 },
	{ left: 21, top: 87 },
	{ left: 34, top: 80 },
	{ left: 47, top: 65 },
	{ left: 59, top: 45 },
	{ left: 68, top: 30 },
	{ left: 74.5, top: 9 },
]

const LABEL_ABOVE_LAST_LOCATION = JOURNEY_ROUTE_POINTS[2]

function shouldShowStepLabelAbove(position: JourneyPoint) {
	return (
		position.left <= LABEL_ABOVE_LAST_LOCATION.left &&
		position.top >= LABEL_ABOVE_LAST_LOCATION.top
	)
}

function getStepDetailText(step: JourneyStep) {
	return step.durationMin ? `${step.durationMin} min` : step.description
}

function getPointOnJourneyRoute(progress: number): JourneyPoint {
	const exactIndex = progress * (JOURNEY_ROUTE_POINTS.length - 1)
	const lowerIndex = Math.floor(exactIndex)
	const upperIndex = Math.min(
		Math.ceil(exactIndex),
		JOURNEY_ROUTE_POINTS.length - 1,
	)

	const lowerPoint = JOURNEY_ROUTE_POINTS[lowerIndex]
	const upperPoint = JOURNEY_ROUTE_POINTS[upperIndex]
	const localProgress = exactIndex - lowerIndex

	return {
		left:
			lowerPoint.left +
			(upperPoint.left - lowerPoint.left) * localProgress,
		top:
			lowerPoint.top +
			(upperPoint.top - lowerPoint.top) * localProgress,
	}
}

function getStepPosition(index: number, total: number): JourneyPoint {
	if (total <= 1) {
		return JOURNEY_ROUTE_POINTS[0]
	}

	return getPointOnJourneyRoute(index / (total - 1))
}

const JOURNEY_PATH_VIEW_BOX = {
	width: 1000,
	height: 420,
}

function toSvgPoint(point: JourneyPoint) {
	return {
		x: (point.left / 100) * JOURNEY_PATH_VIEW_BOX.width,
		y: (point.top / 100) * JOURNEY_PATH_VIEW_BOX.height,
	}
}

function getJourneyPath(points: JourneyPoint[]) {
	if (points.length < 2) {
		return ''
	}

	const svgPoints = points.map(toSvgPoint)

	if (svgPoints.length === 2) {
		return `M ${svgPoints[0].x} ${svgPoints[0].y} L ${svgPoints[1].x} ${svgPoints[1].y}`
	}

	const pathCommands = [`M ${svgPoints[0].x} ${svgPoints[0].y}`]

	for (let index = 0; index < svgPoints.length - 1; index += 1) {
		const previousPoint = svgPoints[index - 1] ?? svgPoints[index]
		const currentPoint = svgPoints[index]
		const nextPoint = svgPoints[index + 1]
		const followingPoint = svgPoints[index + 2] ?? nextPoint

		const controlPointOne = {
			x: currentPoint.x + (nextPoint.x - previousPoint.x) / 6,
			y: currentPoint.y + (nextPoint.y - previousPoint.y) / 6,
		}

		const controlPointTwo = {
			x: nextPoint.x - (followingPoint.x - currentPoint.x) / 6,
			y: nextPoint.y - (followingPoint.y - currentPoint.y) / 6,
		}

		pathCommands.push(
			`C ${controlPointOne.x} ${controlPointOne.y}, ${controlPointTwo.x} ${controlPointTwo.y}, ${nextPoint.x} ${nextPoint.y}`,
		)
	}

	return pathCommands.join(' ')
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

	const journeyPath = useMemo(
		() => getJourneyPath(steps.map((step) => step.position)),
		[steps],
	)

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
				{journeyPath && (
					<svg
						className="assessment-journey__path"
						viewBox="0 0 1000 420"
						preserveAspectRatio="none"
					>
						<path
							d={journeyPath}
							fill="none"
							stroke="rgba(47, 74, 49, 0.58)"
							strokeWidth="4"
							strokeDasharray="12 12"
							strokeLinecap="round"
						/>
					</svg>
				)}

				{steps.map((step) => (
					<button
						key={step.id}
						type="button"
						className={`journey-step journey-step--${step.status} ${
							selectedStep.id === step.id ? 'journey-step--selected' : ''
						}`}
						style={{
							left: `${step.position.left}%`,
							top: `${step.position.top}%`,
						}}
						onClick={() => setSelectedStepId(step.id)}
					>
						{shouldShowStepLabelAbove(step.position) ? (
							<>
								<strong>{step.title}</strong>
								<p>{getStepDetailText(step)}</p>
								<span>{step.number}</span>
							</>
						) : (
							<>
								<span>{step.number}</span>
								<strong>{step.title}</strong>
								<p>{getStepDetailText(step)}</p>
							</>
						)}
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