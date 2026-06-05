export type UserContentProgress = {
	learning_path_ids: string[]
	module_ids: string[]
	learning_unit_ids: string[]
}

export type UserCurrentPosition = {
	learning_path_id: string
	current_module_id?: string | null
	current_learning_unit_id?: string | null
	updated_at?: string | null
}

export type UserQuestionnaireAnswerValue =
	| boolean
	| string
	| number
	| string[]
	| null

export type UserQuestionnaireAnswer = {
	question_id: string
	question: string
	type: string
	answer: UserQuestionnaireAnswerValue

	learning_path_id?: string | null
	module_id?: string | null
	learning_unit_id?: string | null

	topic_id?: string | null
	competency_codes: string[]

	answered_at?: string | null
}

export type UserQuestionnaireAnswers = {
	target_type: 'learning_path' | 'module' | 'learning_unit'
	target_id: string
	last_submitted_at?: string | null
	answers: UserQuestionnaireAnswer[]
}

export type UserProgress = {
	saved: UserContentProgress
	favorites: UserContentProgress
	completed: UserContentProgress
	current_positions: UserCurrentPosition[]
	questionnaire_answers: UserQuestionnaireAnswers[]
}

export type UserResponse = {
	_id: string
	auth_provider?: string | null
	auth_user_id: string
	name?: string | null
	email?: string | null
	created_at: string
	updated_at?: string | null
	progress: UserProgress
}

export type UserCreateRequest = {
	auth_provider?: string | null
	auth_user_id: string
	name?: string | null
	email?: string | null
}

export type UserUpdateRequest = {
	name?: string | null
	email?: string | null
}

