import {
	BookOpen,
	ClipboardList,
	Compass,
	Edit,
	Leaf,
	Lightbulb,
	Map,
	Search,
	Shield,
	Target,
	User,
	Users,
} from 'lucide-react'

export const focusTags = ['Personalizirano', 'Mirno', 'Jasno'] as const

export const processSteps = [
	{
		icon: BookOpen,
		title: 'Vprašalnik',
		text: 'Pokaže izhodišče.',
	},
	{
		icon: Compass,
		title: 'Priporočilo',
		text: 'Uredi naslednji korak.',
	},
	{
		icon: Target,
		title: 'Napredek',
		text: 'Drži smer do cilja.',
	},
] as const

export const outcomeCards = [
	{ icon: Leaf, title: 'Predznanje' },
	{ icon: Target, title: 'Cilj' },
	{ icon: User, title: 'Vloga' },
	{ icon: Compass, title: 'DigComp' },
] as const

export const digcompAreas = [
	{
		title: 'Iskanje, vrednotenje in upravljanje',
		icon: Search,
		description: 'Iskanje, vrednotenje in upravljanje podatkov ter informacij.',
		themeBg: 'bg-[#FACA3A]',
		themeText: 'text-white',
		svgFill: '#FACA3A',
	},
	{
		title: 'Komunikacija in sodelovanje',
		icon: Users,
		description: 'Interakcija, deljenje in sodelovanje v digitalnem okolju.',
		themeBg: 'bg-[#4888C9]',
		themeText: 'text-white',
		svgFill: '#4888C9',
	},
	{
		title: 'Ustvarjanje digitalnih vsebin',
		icon: Edit,
		description: 'Razvoj, integracija in obdelava digitalnih virov.',
		themeBg: 'bg-[#F29111]',
		themeText: 'text-white',
		svgFill: '#F29111',
	},
	{
		title: 'Varnost in odgovorna raba',
		icon: Shield,
		description: 'Zaščita naprav, podatkov, zasebnosti in zdravja.',
		themeBg: 'bg-[#4AAA4B]',
		themeText: 'text-white',
		svgFill: '#4AAA4B',
	},
	{
		title: 'Prepoznavanje in reševanje težav',
		icon: Lightbulb,
		description: 'Prepoznavanje logičnih potreb in reševanje tehničnih izzivov.',
		themeBg: 'bg-[#F05A4E]',
		themeText: 'text-white',
		svgFill: '#F05A4E',
	},
] as const

export const learningPathCards = [
	{
		icon: Map,
		title: 'Preglej izbrano učno pot',
		text: 'Najprej si ogledaš, kaj pot vključuje: module, učne enote, kompetence in vsebine, ki te vodijo proti cilju.',
	},
	{
		icon: Target,
		title: 'Začni iz svoje pozicije',
		text: 'Ni treba začeti od začetka. Pomembno je razumeti, kaj že znaš, kaj še potrebuješ in kje je tvoj najbolj smiseln naslednji korak.',
	},
] as const

export const positionCards = [
	{
		icon: ClipboardList,
		title: 'Izpolni vprašalnik',
		text: 'Vprašanja so povezana z vsebino izbrane učne poti. Pomagajo oceniti tvoje trenutno znanje znotraj poti, ki te zanima.',
	},
	{
		icon: Compass,
		title: 'Odkrij svojo pozicijo',
		text: 'Rezultat pokaže, katere dele poti že obvladaš in katera področja je dobro še utrditi, preden nadaljuješ.',
	},
] as const

export const flowSteps = [
	'Izbira poti',
	'Pregled vsebine',
	'Vprašalnik',
	'Tvoja pozicija',
	'Naslednji korak',
] as const

export const searchFilters = [
	{ label: 'Moduli', value: 'module' },
	{ label: 'Učne poti', value: 'learning_path' },
	{ label: 'Učne enote', value: 'learning_unit' },
] as const

export const STORY_SECTIONS_DATA = [
	{
		id: 'learning-paths',
		eyebrow: 'Učne poti',
		title: 'Začni z večjo sliko.',
		description: 'Učna pot ti pokaže celotno smer učenja. Namesto posameznih nepovezanih vsebin vidiš zaporedje korakov, ki te vodijo proti jasnemu cilju.',
		cards: [
			{ title: 'Pregled', front: 'Vidiš celotno pot', back: 'Učna pot združi module in učne enote v logično zaporedje.' },
			{ title: 'Usmeritev', front: 'Lažje izbereš začetek', back: 'Pomaga ti razumeti, katero področje je zate najbolj smiselno.' },
		],
	},
	{
		id: 'modules',
		eyebrow: 'Moduli',
		title: 'Večjo pot razdeli na razumljive korake.',
		description: 'Modul predstavlja zaokrožen del učne poti. Vsak modul ima svoj namen, zato lažje slediš napredku in razumeš, kaj posamezen korak prinese.',
		cards: [
			{ title: 'Korak', front: 'Manjši del večje poti', back: 'Modul razdeli širše področje na bolj obvladljive vsebinske sklope.' },
			{ title: 'Napredek', front: 'Slediš svojemu tempu', back: 'Vsak modul ti pomaga videti, kaj si že pregledal in kaj še sledi.' },
		],
	},
	{
		id: 'learning-units',
		eyebrow: 'Učne enote',
		title: 'Uči se skozi kratke in konkretne vsebine.',
		description: 'Učna enota je najmanjši del strukture. Namenjena je hitremu pregledu konkretnega znanja, spretnosti ali aktivnosti znotraj modula.',
		cards: [
			{ title: 'Fokus', front: 'Ena vsebina naenkrat', back: 'Vsaka učna enota predstavi jasen in omejen del znanja.' },
			{ title: 'Samostojnost', front: 'Pregledaš jo lahko posebej', back: 'Enote lahko raziskuješ znotraj modula ali kot samostojen vir.' },
		],
	},
	{
		id: 'questionnaire',
		eyebrow: 'Vprašalnik',
		title: 'Preveri, kje si trenutno.',
		description: 'Vprašalnik ti pomaga oceniti trenutno znanje in prepoznati področja, kjer imaš največ prostora za napredek.',
		cards: [
			{ title: 'Samoocena', front: 'Razumeš svoje izhodišče', back: 'Odgovori pokažejo, katera področja že poznaš in katera potrebujejo več pozornosti.' },
			{ title: 'Priporočilo', front: 'Dobiš bolj jasno smer', back: 'Rezultat ti pomaga izbrati primernejšo pot, modul ali naslednjo vsebino.' },
		],
	},
]


