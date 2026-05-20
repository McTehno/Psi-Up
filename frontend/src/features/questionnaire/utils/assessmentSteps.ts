import voiceFirstQuestion from '../../../assets/audio/voiceFirstQuestion.m4a'

// Ko dodaš nove voice datoteke, jih samo uvoziš tukaj:
// import voiceQuestionOne from '../../../assets/audio/voiceQuestionOne.m4a'
// import voiceQuestionTwo from '../../../assets/audio/voiceQuestionTwo.m4a'

export const assessmentAudio = {
	groupSelection: voiceFirstQuestion,

	// Zaenkrat uporabljamo isti voice kot placeholder.
	// Kasneje zamenjaš posamezne indexe z ustreznimi .m4a datotekami.
	questions: [
		voiceFirstQuestion,
		voiceFirstQuestion,
		voiceFirstQuestion,
		voiceFirstQuestion,
		voiceFirstQuestion,
	],
}

export const assessmentCopy = {
	groupSelection: {
		label: 'Pa pričnimo',
		title: 'V katero skupino kompetenc bi se podali?',
		description: 'Izberite ali povprašajte o določeni skupini kompetenc.',
		note: 'Izberite ustrezno kompetenco ali napišite vprašanje, da vam posredujem podrobnejše informacije.',
	},
	questionnaire: {
		label: 'Vprašalnik',
		description: 'Izberite odgovor, ki najbolje opisuje vaše trenutno stanje.',
	},
}