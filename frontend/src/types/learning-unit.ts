/**
 * DigComp kompetenca, ki jo učna enota pokriva.
 */
export type DigCompCompetencyResponse = {
	code: string
	title: string
	description: string
}

/**
 * Vsebinska tema znotraj učne enote.
 *
 * Tema ima stabilen ID, da se lahko odgovori vprašalnika
 * povežejo na topic_id namesto na besedilo teme.
 */
export type ContentTopicResponse = {
	id: string
	title: string
	related_competency_codes: string[]
}

/**
 * Vprašanje za samooceno znotraj učne enote.
 */
export type SelfAssessmentQuestionResponse = {
	id: string
	question: string
	type: string
	related_topic?: string | null
	related_topic_id?: string | null
	related_competency_codes: string[]
}

/**
 * Kratek prikaz modula, ki vsebuje izbrano učno enoto.
 *
 * Uporablja se na detail strani učne enote v sekciji
 * priporočenih oziroma povezanih modulov.
 */
export type RecommendedModuleResponse = {
	_id: string
	title: string
	short_description: string
	duration_hours?: number | null
	keywords: string[]
	domains: string[]
}

/**
 * Osnovni response za učno enoto.
 *
 * Uporablja se pri seznamih, osnovnem detail prikazu in kot osnova
 * za razširjen detail response.
 */
export type LearningUnitResponse = {
	_id: string
	title: string
	short_description: string
	duration_hours?: number | null
	keywords: string[]

	content_topics: ContentTopicResponse[]
	acquired_competencies: string[]
	digcomp_competencies: DigCompCompetencyResponse[]

	delivery_mode?: string | null
	provider?: string | null
	target_audience?: string | null
	prerequisites: string[]
	knowledge_assessment?: string | null
	certificate?: string | null

	self_assessment_questions: SelfAssessmentQuestionResponse[]
}

/**
 * Razširjen response za detail stran učne enote.
 *
 * Backend pri /learning-units/:id/detail doda tudi module,
 * ki vsebujejo to učno enoto.
 */
export type LearningUnitDetailResponse = LearningUnitResponse & {
	recommended_modules: RecommendedModuleResponse[]
}

/**
 * Referenca učne enote znotraj modula.
 *
 * Uporablja se pri prikazu zaporedja učnih enot v modulu.
 */
export type LearningUnitReferenceResponse = {
	learning_unit_id: string
	order?: number | null
	parallel_group?: string | null
	is_required: boolean
	prerequisites: string[]
}