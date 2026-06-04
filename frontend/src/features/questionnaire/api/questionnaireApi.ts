export type QuestionnaireTargetType =
	| 'learning_unit'
	| 'module'
	| 'learning_path'

export type QuestionnaireQuestion = {
	id: string
	question: string
	type: 'yes_no'
	learning_unit_id: string
	related_skill: string
}

export type QuestionnaireResponse = {
	target_type: QuestionnaireTargetType
	target_id: string
	title: string
	questions: QuestionnaireQuestion[]
}

export type AssessmentAnswer = {
	question_id: string
	learning_unit_id: string
	answer: boolean
}

export async function getQuestionnaire(
	targetType: QuestionnaireTargetType,
	targetId: string,
): Promise<QuestionnaireResponse> {
	const response = await fetch(
		`http://127.0.0.1:8000/api/questionnaires?target_type=${targetType}&target_id=${targetId}`,
	)

	if (!response.ok) {
		throw new Error('Vprašalnika ni bilo mogoče naloĹľiti.')
	}

	return response.json()
}

export async function evaluateAssessment(payload: {
	user_id: string
	target_type: QuestionnaireTargetType
	target_id: string
	answers: AssessmentAnswer[]
}) {
	const response = await fetch('http://127.0.0.1:8000/api/assessments/evaluate', {
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

