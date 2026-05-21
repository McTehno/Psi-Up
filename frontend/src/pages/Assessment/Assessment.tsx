import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import womanImage from '../../assets/woman.png'
import { assessmentCopy } from '../../features/questionnaire/utils/assessmentSteps'
import AssessmentLayout from '../../features/questionnaire/components/AssessmentLayout'
import AssessmentHeader from '../../features/questionnaire/components/AssessmentHeader'
import AssessmentIntro from '../../features/questionnaire/components/AssessmentIntro'
import AssessmentContextBox from '../../features/questionnaire/components/AssessmentContextBox'
import AssessmentActions from '../../features/questionnaire/components/AssessmentActions'
import QuestionnaireQuestion from '../../features/questionnaire/components/QuestionnaireQuestion'
import { getAssessmentVoice } from '../../features/questionnaire/utils/assessmentVoice'
import { useAudioPlayer } from '../../features/questionnaire/hooks/useAudioPlayer'
import AssessmentJourneyResult from '../../features/questionnaire/components/AssessmentJourneyResult'
import './Assessment.css'

type QuestionnaireTargetType = 'learning_unit' | 'module' | 'learning_path'

type AnswerOption = {
	answer: string
	weight: boolean
}

type BackendQuestion = {
	id: string
	question: string
	type: 'yes_no'
	learning_unit_id: string
	related_skill: string
}

type QuestionnaireItem = {
	id: string
	question: string
	type: 'yes_no'
	learning_unit_id: string
	related_skill: string
	answers: AnswerOption[]
}

type QuestionnaireResponse = {
	target_type: QuestionnaireTargetType
	target_id: string
	title: string
	questions: BackendQuestion[]
}

type AssessmentResult = {
	user_id: string
	target_type: QuestionnaireTargetType
	target_id: string
	start_module_id: string | null
	start_learning_unit_id: string | null
	skipped_modules: string[]
	skipped_learning_units: string[]
	recommended_next_modules: string[]
	recommended_next_learning_units: string[]
	summary: string
}

type CompetencyGroup = {
	_id: string
	title: string
	description?: string
	competencies?: {
		competency_id: string
		title?: string
	}[]
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

type AssessmentPhase = 'group-selection' | 'questionnaire' | 'completed'

const API_BASE_URL = 'http://127.0.0.1:8000/api'
const USER_ID = 'user_001'

const yesNoAnswers: AnswerOption[] = [
	{ answer: 'Da', weight: true },
	{ answer: 'Ne', weight: false },
]

function normalizeTargetType(value: string | null): QuestionnaireTargetType {
	if (
		value === 'learning_unit' ||
		value === 'module' ||
		value === 'learning_path'
	) {
		return value
	}

	return 'module'
}

async function getModuleDetail(moduleId: string): Promise<ModuleDetail> {
	const response = await fetch(`${API_BASE_URL}/modules/${moduleId}/detail`)

	if (!response.ok) {
		throw new Error('Podrobnosti modula ni bilo mogoče naložiti.')
	}

	return response.json()
}

async function getQuestionnaire(
	targetType: QuestionnaireTargetType,
	targetId: string,
): Promise<QuestionnaireResponse> {
	const response = await fetch(
		`${API_BASE_URL}/questionnaires?target_type=${targetType}&target_id=${targetId}`,
	)

	if (!response.ok) {
		throw new Error('Vprašalnika ni bilo mogoče naložiti.')
	}

	return response.json()
}

async function evaluateAssessment(payload: {
	user_id: string
	target_type: QuestionnaireTargetType
	target_id: string
	answers: {
		question_id: string
		learning_unit_id: string
		answer: boolean
	}[]
}): Promise<AssessmentResult> {
	const response = await fetch(`${API_BASE_URL}/assessments/evaluate`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	})

	if (!response.ok) {
		throw new Error('Ocene ni bilo mogoče poslati.')
	}

	return response.json()
}

function Assessment() {
	const [searchParams] = useSearchParams()

	const targetType = normalizeTargetType(searchParams.get('target_type'))
	const targetId = searchParams.get('target_id') ?? 'mod_002'

	const [phase, setPhase] = useState<AssessmentPhase>('questionnaire')
	const [questionnaireTitle, setQuestionnaireTitle] = useState('')
	const [questionnaire, setQuestionnaire] = useState<QuestionnaireItem[]>([])
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [selectedAnswers, setSelectedAnswers] = useState<Record<number, AnswerOption>>({})
	const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
	const [isLoadingQuestionnaire, setIsLoadingQuestionnaire] = useState(true)
	const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [isChatOpen, setIsChatOpen] = useState(false)
	const [moduleDetail, setModuleDetail] = useState<ModuleDetail | null>(null)

	const currentAudioSrc = getAssessmentVoice({
		phase,
		groupId: targetId,
		questionIndex: currentQuestionIndex,
	})

	const {
		isPlaying: isAudioPlaying,
		toggle: toggleAudio,
		hasAudio,
	} = useAudioPlayer(currentAudioSrc)

	const selectedGroup = useMemo<CompetencyGroup | undefined>(() => {
		if (!questionnaireTitle) return undefined

		return {
			_id: targetId,
			title: questionnaireTitle,
			description: `Vprašalnik za ${targetType}`,
			competencies: [],
		}
	}, [questionnaireTitle, targetId, targetType])

	const currentQuestion = questionnaire[currentQuestionIndex]
	const selectedAnswer = selectedAnswers[currentQuestionIndex]

	const totalSteps = questionnaire.length || 1
	const currentStepNumber =
		phase === 'completed'
			? totalSteps
			: Math.min(currentQuestionIndex + 1, totalSteps)

	const currentLabel = assessmentCopy.questionnaire.label

	const currentTitle =
		phase === 'completed'
			? ''
			: currentQuestion?.question ?? 'Vprašalnik se nalaga ...'

	const currentDescription =
		phase === 'completed'
			? ''
			: assessmentCopy.questionnaire.description

	const canGoPrevious =
		phase === 'completed' || (phase === 'questionnaire' && currentQuestionIndex > 0)

	const canGoNext =
		phase === 'questionnaire'
			? Boolean(selectedAnswer) && !isSubmittingAssessment
			: false

	const nextButtonLabel =
		isSubmittingAssessment
			? 'Pošiljanje ...'
			: currentQuestionIndex === questionnaire.length - 1
				? 'Zaključi →'
				: 'Naslednjo →'

	useEffect(() => {
		async function loadQuestionnaire() {
			setIsLoadingQuestionnaire(true)
			setError(null)

			try {
				const data = await getQuestionnaire(targetType, targetId)
				if (targetType === 'module') {
					const detail = await getModuleDetail(targetId)
					setModuleDetail(detail)
				}
				setQuestionnaireTitle(data.title)
				setQuestionnaire(
					data.questions.map((question) => ({
						...question,
						answers: yesNoAnswers,
					})),
				)
				setCurrentQuestionIndex(0)
				setSelectedAnswers({})
				setAssessmentResult(null)
				setPhase('questionnaire')
			} catch (error) {
				console.error(error)
				setError('Vprašalnika ni bilo mogoče naložiti. Preverite, če backend deluje.')
			} finally {
				setIsLoadingQuestionnaire(false)
			}
		}

		loadQuestionnaire()
	}, [targetType, targetId])

	function handleSelectAnswer(answer: AnswerOption) {
		setSelectedAnswers((currentAnswers) => ({
			...currentAnswers,
			[currentQuestionIndex]: answer,
		}))
	}

	async function submitAssessment() {
		setIsSubmittingAssessment(true)
		setError(null)

		try {
			const answers = questionnaire.map((question, index) => ({
				question_id: question.id,
				learning_unit_id: question.learning_unit_id,
				answer: selectedAnswers[index]?.weight ?? false,
			}))

			const result = await evaluateAssessment({
				user_id: USER_ID,
				target_type: targetType,
				target_id: targetId,
				answers,
			})

			setAssessmentResult(result)
			setPhase('completed')
		} catch (error) {
			console.error(error)
			setError('Napaka pri pošiljanju vprašalnika. Preverite, če backend deluje.')
		} finally {
			setIsSubmittingAssessment(false)
		}
	}

	async function goToNextStep() {
		if (phase !== 'questionnaire' || !selectedAnswer) return

		const isLastQuestion = currentQuestionIndex >= questionnaire.length - 1

		if (isLastQuestion) {
			await submitAssessment()
			return
		}

		setCurrentQuestionIndex((index) => index + 1)
	}

	function goToPreviousStep() {
		if (phase === 'completed') {
			setPhase('questionnaire')
			setCurrentQuestionIndex(Math.max(questionnaire.length - 1, 0))
			return
		}

		if (phase === 'questionnaire' && currentQuestionIndex > 0) {
			setCurrentQuestionIndex((index) => index - 1)
		}
	}

	if (error) {
		return <p>{error}</p>
	}

	if (isLoadingQuestionnaire) {
		return <p>Nalaganje vprašalnika ...</p>
	}

	return (
		<AssessmentLayout
			imageSrc={womanImage}
			defaultNote={assessmentCopy.groupSelection.note}
			phase={phase}
			selectedGroup={selectedGroup}
			currentQuestion={currentQuestion}
			selectedAnswer={selectedAnswer}
		>
			<AssessmentHeader
				stepNumber={currentStepNumber}
				totalSteps={Math.max(totalSteps, 1)}
				label={currentLabel}
				isAudioPlaying={isAudioPlaying}
				onToggleAudio={toggleAudio}
				hasAudio={hasAudio}
			/>

			<AssessmentIntro
				title={currentTitle}
				description={currentDescription}
			/>

			{phase === 'questionnaire' && currentQuestion && (
				<QuestionnaireQuestion
					question={currentQuestion}
					selectedAnswer={selectedAnswer}
					onSelectAnswer={handleSelectAnswer}
				/>
			)}

			{phase === 'completed' && (
				<AssessmentJourneyResult
					title={questionnaireTitle}
					result={assessmentResult}
					moduleDetail={moduleDetail}
				/>
			)}

			<div className="assessment-chat-toggle">
				<button
					type="button"
					className="assessment-chat-toggle__button"
					onClick={() => setIsChatOpen((value) => !value)}
				>
					{isChatOpen ? 'Skrij pomočnika' : 'Vprašaj pomočnika'}
				</button>

				{isChatOpen && <AssessmentContextBox />}
			</div>

			<AssessmentActions
				canGoPrevious={canGoPrevious}
				canGoNext={canGoNext}
				onPrevious={goToPreviousStep}
				onNext={goToNextStep}
				nextLabel={nextButtonLabel}
			/>
		</AssessmentLayout>
	)
}

export default Assessment