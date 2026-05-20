import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	getCompetencyGroups,
	getCompetencyGroupQuestionnaire,
} from '../../features/competencies/api/competencyGroups'
import { getCompetencyRecommendations, generateLearningPath } from '../../features/learning-paths/api/learningPaths'
import womanImage from '../../../public/woman.png'
import { assessmentCopy } from '../../features/questionnaire/utils/assessmentSteps'
import AssessmentLayout from '../../features/questionnaire/components/AssessmentLayout'
import AssessmentHeader from '../../features/questionnaire/components/AssessmentHeader'
import AssessmentIntro from '../../features/questionnaire/components/AssessmentIntro'
import AssessmentOptions from '../../features/questionnaire/components/AssessmentOptions'
import AssessmentContextBox from '../../features/questionnaire/components/AssessmentContextBox'
import AssessmentActions from '../../features/questionnaire/components/AssessmentActions'
import QuestionnaireQuestion from '../../features/questionnaire/components/QuestionnaireQuestion'
import { getAssessmentVoice } from '../../features/questionnaire/utils/assessmentVoice'
import { useAudioPlayer } from '../../features/questionnaire/hooks/useAudioPlayer'
import './Assessment.css'

type Competency = {
        competency_id: string
        title?: string
}

type AnswerOption = {
	answer: string
	weight: number
}

type QuestionnaireItem = {
	question: string
	answers: AnswerOption[]
}

type CompetencyGroup = {
	_id: string
	title: string
	description?: string
	competencies?: Competency[]
}

type AssessmentPhase = 'group-selection' | 'questionnaire' | 'completed'

function Assessment() {
	const navigate = useNavigate()
	const [phase, setPhase] = useState<AssessmentPhase>('group-selection')
	const [competencyGroups, setCompetencyGroups] = useState<CompetencyGroup[]>([])
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
	const [questionnaire, setQuestionnaire] = useState<QuestionnaireItem[]>([])
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [selectedAnswers, setSelectedAnswers] = useState<Record<number, AnswerOption>>({})
	const [isLoadingQuestionnaire, setIsLoadingQuestionnaire] = useState(false)
	const [isGeneratingPath, setIsGeneratingPath] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const currentAudioSrc = getAssessmentVoice({
		phase,
		groupId: selectedGroupId,
		questionIndex: currentQuestionIndex,
	})

	const {
		isPlaying: isAudioPlaying,
		toggle: toggleAudio,
		hasAudio,
	} = useAudioPlayer(currentAudioSrc)

	const selectedGroup = useMemo(() => {
		if (!selectedGroupId) return undefined

		return competencyGroups.find((group) => group._id === selectedGroupId)
	}, [competencyGroups, selectedGroupId])

	const currentQuestion = questionnaire[currentQuestionIndex]
	const selectedAnswer = selectedAnswers[currentQuestionIndex]

	const totalSteps =
		phase === 'group-selection'
			? 1
			: questionnaire.length + 1

	const currentStepNumber =
		phase === 'group-selection'
			? 1
			: currentQuestionIndex + 2

	const currentLabel =
		phase === 'group-selection'
			? assessmentCopy.groupSelection.label
			: assessmentCopy.questionnaire.label

	const currentTitle =
		phase === 'group-selection'
			? assessmentCopy.groupSelection.title
			: currentQuestion?.question ?? 'Vprašanje ni na voljo.'

	const currentDescription =
		phase === 'group-selection'
			? assessmentCopy.groupSelection.description
			: assessmentCopy.questionnaire.description

	const canGoPrevious = phase === 'questionnaire' || phase === 'completed'

	const canGoNext =
		phase === 'group-selection'
			? Boolean(selectedGroupId) && !isLoadingQuestionnaire
			: phase === 'questionnaire'
				? Boolean(selectedAnswer)
				: phase === 'completed'
					? !isGeneratingPath
					: false

	const nextButtonLabel =
		phase === 'group-selection' && isLoadingQuestionnaire
			? 'Nalaganje...'
			: phase === 'questionnaire' &&
					currentQuestionIndex === questionnaire.length - 1
				? 'Zaključi →'
				: phase === 'completed'
					? (isGeneratingPath ? 'Generiranje...' : 'Ustvari učno pot →')
					: 'Naslednjo →'

	useEffect(() => {
		const loadCompetencyGroups = async () => {
			try {
				const data = await getCompetencyGroups()

				setCompetencyGroups(data)
				setSelectedGroupId(null)
				setQuestionnaire([])
				setCurrentQuestionIndex(0)
				setSelectedAnswers({})
				setPhase('group-selection')
			} catch (error) {
				setError('Podatkov ni bilo mogoče naložiti.')
				console.error(error)
			}
		}

		loadCompetencyGroups()
	}, [])

	function handleSelectGroup(groupId: string) {
		setSelectedGroupId(groupId)
		setQuestionnaire([])
		setCurrentQuestionIndex(0)
		setSelectedAnswers({})
	}

	function handleSelectAnswer(answer: AnswerOption) {
		setSelectedAnswers((currentAnswers) => ({
			...currentAnswers,
			[currentQuestionIndex]: answer,
		}))
	}

	async function loadQuestionnaireForSelectedGroup() {
		if (!selectedGroupId) return

		setIsLoadingQuestionnaire(true)

		try {
			const data = await getCompetencyGroupQuestionnaire(selectedGroupId)

			const fetchedQuestionnaire = Array.isArray(data)
				? data
				: data.questionnaire ?? []

			setQuestionnaire(fetchedQuestionnaire)
			setCurrentQuestionIndex(0)
			setSelectedAnswers({})
			setPhase('questionnaire')
		} catch (error) {
			setError('Vprašalnika ni bilo mogoče naložiti.')
			console.error(error)
		} finally {
			setIsLoadingQuestionnaire(false)
		}
	}

	async function goToNextStep() {
		if (phase === 'group-selection') {
			if (!selectedGroupId) return

			await loadQuestionnaireForSelectedGroup()
			return
		}

		if (phase === 'questionnaire') {
			if (!selectedAnswer) return

			const isLastQuestion = currentQuestionIndex >= questionnaire.length - 1

			if (isLastQuestion) {
				setPhase('completed')

				console.log('Assessment result:', {
					selectedGroup,
					selectedAnswers,
				})

				return
			}

			setCurrentQuestionIndex((index) => index + 1)
		}

		if (phase === 'completed') {
			if (!selectedGroupId) return;
			setIsGeneratingPath(true);
			setError(null);
			try {
				const answersPayload = questionnaire.map((item, index) => {
					const answerObj = selectedAnswers[index];
					const answerIndex = item.answers.findIndex(a => a.answer === answerObj.answer);
					return {
						question_index: index,
						answer_index: answerIndex !== -1 ? answerIndex : 0
					};
				});

				const recommendation = await getCompetencyRecommendations(selectedGroupId, answersPayload);
				
				if (recommendation.recommended_competencies && recommendation.recommended_competencies.length > 0) {
					const firstRec = recommendation.recommended_competencies[0];
					const learningPath = await generateLearningPath(firstRec.competency_id, firstRec.level);
					
					navigate('/path', { state: { learningPath } });
				} else {
					setError('Ni bilo mogoče najti priporočenih kompetenc.');
				}
			} catch (err) {
				console.error(err);
				setError('Napaka pri generiranju učne poti. Preverite, če strežnik deluje.');
			} finally {
				setIsGeneratingPath(false);
			}
		}
	}

	function goToPreviousStep() {
		if (phase === 'completed') {
			setPhase('questionnaire')
			setCurrentQuestionIndex(Math.max(questionnaire.length - 1, 0))
			return
		}

		if (phase === 'questionnaire') {
			if (currentQuestionIndex === 0) {
				setPhase('group-selection')
				return
			}

			setCurrentQuestionIndex((index) => index - 1)
		}
	}

	if (error) {
		return <p>{error}</p>
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
				title={
					phase === 'completed'
						? 'Hvala, vprašalnik je zaključen.'
						: currentTitle
				}
				description={
					phase === 'completed'
						? 'Na podlagi odgovorov lahko zdaj pripravimo priporočeno učno pot.'
						: currentDescription
				}
			/>

			{phase === 'group-selection' && (
				<AssessmentOptions
					groups={competencyGroups}
					selectedGroupId={selectedGroupId}
					onSelectGroup={handleSelectGroup}
				/>
			)}

			{phase === 'questionnaire' && currentQuestion && (
				<QuestionnaireQuestion
					question={currentQuestion}
					selectedAnswer={selectedAnswer}
					onSelectAnswer={handleSelectAnswer}
				/>
			)}

			{phase === 'completed' && (
				<div className="assessment-summary">
					<h2>Izbrana skupina</h2>
					<p>{selectedGroup?.title}</p>

					<h2>Vaši odgovori</h2>

					<ul>
						{questionnaire.map((item, index) => (
							<li key={item.question}>
								<strong>{item.question}</strong>
								<span>{selectedAnswers[index]?.answer ?? 'Brez odgovora'}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			<AssessmentContextBox />

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