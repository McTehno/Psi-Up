import voiceFirstQuestion from '../../../assets/audio/voiceFirstQuestion.m4a'

import skup1Question1 from '../../../assets/audio/skup1Question1.m4a'
import skup1Question2 from '../../../assets/audio/skup1Question2.m4a'
import skup1Question3 from '../../../assets/audio/skup1Question3.m4a'

import skup2Question1 from '../../../assets/audio/skup2Question1.m4a'
import skup2Question2 from '../../../assets/audio/skup2Question2.m4a'
import skup2Question3 from '../../../assets/audio/skup2Question3.m4a'

type AssessmentPhase = 'group-selection' | 'questionnaire' | 'completed'

type GetAssessmentVoiceParams = {
	phase: AssessmentPhase
	groupId: string | null
	questionIndex: number
}

const defaultQuestionVoice = voiceFirstQuestion

const questionnaireVoices: Record<string, string[]> = {
	skup_1: [
		skup1Question1,
		skup1Question2,
		skup1Question3,
	],

	 skup_2: [
	 	skup2Question1,
	 	skup2Question2,
	 	skup2Question3,
	 ],
}

export function getAssessmentVoice({
	phase,
	groupId,
	questionIndex,
}: GetAssessmentVoiceParams) {
	if (phase === 'group-selection') {
		return voiceFirstQuestion
	}

	if (phase === 'questionnaire' && groupId) {
		return questionnaireVoices[groupId]?.[questionIndex] ?? defaultQuestionVoice
	}

	if (phase === 'completed') {
		return undefined
	}

	return undefined
}