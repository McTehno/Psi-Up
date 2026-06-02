export type QuestionnaireTargetType =
	| 'learning_path'
	| 'module'
	| 'learning_unit'

/**
 * Backend trenutno najpogosteje uporablja yes_no,
 * ampak polje ostane string, ker shema dopušča razširitev
 * z drugimi tipi vprašanj.
 */
export type QuestionnaireQuestionType = 'yes_no' | string

export type QuestionnaireAnswerValue =
	| boolean
	| string
	| number
	| string[]
	| null

/**
 * En vir vprašanja.
 *
 * Če se isto vprašanje pojavi v več učnih enotah ali modulih,
 * se vprašanje prikaže enkrat, sources pa povejo,
 * na katere vsebine se odgovor nanaša.
 */
export type QuestionnaireQuestionSourceResponse = {
	learning_path_id?: string | null
	module_id?: string | null
	learning_unit_id?: string | null

	topic_id?: string | null
	related_topic?: string | null
	competency_codes: string[]
}

/**
 * Posamezno vprašanje v vprašalniku.
 */
export type QuestionnaireQuestionResponse = {
	id: string
	question: string
	type: QuestionnaireQuestionType

	learning_path_id?: string | null
	module_id?: string | null
	learning_unit_id?: string | null

	related_topic?: string | null
	related_topic_id?: string | null
	related_competency_codes: string[]

	sources: QuestionnaireQuestionSourceResponse[]
}

/**
 * Celoten vprašalnik za učno pot, modul ali učno enoto.
 */
export type QuestionnaireResponse = {
	target_type: QuestionnaireTargetType
	target_id: string
	title?: string | null
	questions: QuestionnaireQuestionResponse[]
}

/**
 * Posamezen odgovor, ki ga frontend pošlje backendu.
 *
 * Za yes_no vprašanja je answer boolean.
 * Tip ostane širši, ker backend dopušča tudi druge tipe odgovorov.
 */
export type QuestionnaireAnswerRequest = {
	question_id: string
	question: string
	type: QuestionnaireQuestionType
	answer: QuestionnaireAnswerValue

	learning_path_id?: string | null
	module_id?: string | null
	learning_unit_id?: string | null

	topic_id?: string | null
	competency_codes: string[]
}

/**
 * Request za oddajo vprašalnika.
 *
 * To je telo requesta za assessment/evaluate oziroma podobno logiko,
 * kjer frontend pošlje izpolnjene odgovore.
 */
export type QuestionnaireSubmitRequest = {
	user_id: string
	target_type: QuestionnaireTargetType
	target_id: string
	answers: QuestionnaireAnswerRequest[]
}

/**
 * Združljivostni alias za obstoječo frontend assessment logiko.
 *
 * Če frontend trenutno uporablja AssessmentEvaluateRequest,
 * ga lahko začasno pustimo, da ne lomimo importov.
 */
export type AssessmentEvaluateRequest = QuestionnaireSubmitRequest