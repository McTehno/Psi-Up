export type ContentType = 'learning_path' | 'module' | 'learning_unit'

export type QuestionnaireTargetType =
	| 'learning_path'
	| 'module'
	| 'learning_unit'

export type QuestionnaireAnswerValue =
	| boolean
	| string
	| number
	| string[]
	| null

export type ContentProgressResponse = {
	learning_path_ids: string[]
	module_ids: string[]
	learning_unit_ids: string[]
}

export type CurrentPositionResponse = {
	learning_path_id: string
	current_module_id?: string | null
	current_learning_unit_id?: string | null
	updated_at?: string | null
}

export type QuestionnaireAnswerResponse = {
	question_id: string
	question: string
	type: string
	answer: QuestionnaireAnswerValue
	was_answered: boolean

	learning_path_id?: string | null
	module_id?: string | null
	learning_unit_id?: string | null

	topic_id?: string | null
	competency_codes: string[]

	answered_at?: string | null
}

export type QuestionnaireAnswersResponse = {
	target_type: QuestionnaireTargetType
	target_id: string
	last_submitted_at?: string | null
	answers: QuestionnaireAnswerResponse[]
}

export type SaveQuestionnaireAnswersRequest = {
	target_type: QuestionnaireTargetType
	target_id: string
	answers: QuestionnaireAnswerResponse[]
}

export type UserProgressResponse = {
	_id?: string | null
	user_id: string

	saved: ContentProgressResponse
	favorites: ContentProgressResponse
	completed: ContentProgressResponse

	current_positions: CurrentPositionResponse[]
	questionnaire_answers: QuestionnaireAnswersResponse[]
}

export type UserProgressCreateRequest = {
	user_id: string
}

export type SaveContentRequest = {
	content_id: string
	content_type: ContentType
}

export type FavoriteContentRequest = {
	content_id: string
	content_type: ContentType
}

export type CompleteContentRequest = {
	content_id: string
	content_type: ContentType
}

export type UpdateCurrentPositionRequest = {
	learning_path_id: string
	current_module_id?: string | null
	current_learning_unit_id?: string | null
}

