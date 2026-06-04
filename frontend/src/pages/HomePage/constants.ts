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
		title: 'VpraĹˇalnik',
		text: 'PokaĹľe izhodiĹˇÄŤe.',
	},
	{
		icon: Compass,
		title: 'PriporoÄŤilo',
		text: 'Uredi naslednji korak.',
	},
	{
		icon: Target,
		title: 'Napredek',
		text: 'DrĹľi smer do cilja.',
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
		description: 'ZaĹˇÄŤita naprav, podatkov, zasebnosti in zdravja.',
		themeBg: 'bg-[#4AAA4B]',
		themeText: 'text-white',
		svgFill: '#4AAA4B',
	},
	{
		title: 'Prepoznavanje in reĹˇevanje teĹľav',
		icon: Lightbulb,
		description: 'Prepoznavanje logiÄŤnih potreb in reĹˇevanje tehniÄŤnih izzivov.',
		themeBg: 'bg-[#F05A4E]',
		themeText: 'text-white',
		svgFill: '#F05A4E',
	},
] as const

export const learningPathCards = [
	{
		icon: Map,
		title: 'Preglej izbrano uÄŤno pot',
		text: 'Najprej si ogledaĹˇ, kaj pot vkljuÄŤuje: module, uÄŤne enote, kompetence in vsebine, ki te vodijo proti cilju.',
	},
	{
		icon: Target,
		title: 'ZaÄŤni iz svoje pozicije',
		text: 'Ni treba zaÄŤeti od zaÄŤetka. Pomembno je razumeti, kaj Ĺľe znaĹˇ, kaj Ĺˇe potrebujeĹˇ in kje je tvoj najbolj smiseln naslednji korak.',
	},
] as const

export const positionCards = [
	{
		icon: ClipboardList,
		title: 'Izpolni vpraĹˇalnik',
		text: 'VpraĹˇanja so povezana z vsebino izbrane uÄŤne poti. Pomagajo oceniti tvoje trenutno znanje znotraj poti, ki te zanima.',
	},
	{
		icon: Compass,
		title: 'Odkrij svojo pozicijo',
		text: 'Rezultat pokaĹľe, katere dele poti Ĺľe obvladaĹˇ in katera podroÄŤja je dobro Ĺˇe utrditi, preden nadaljujeĹˇ.',
	},
] as const

export const flowSteps = [
	'Izbira poti',
	'Pregled vsebine',
	'VpraĹˇalnik',
	'Tvoja pozicija',
	'Naslednji korak',
] as const

export const searchFilters = [
	{ label: 'Moduli', value: 'module' },
	{ label: 'UÄŤne poti', value: 'learning_path' },
	{ label: 'UÄŤne enote', value: 'learning_unit' },
] as const

export const STORY_SECTIONS_DATA = [
	{
		id: 'learning-paths',
		eyebrow: 'UÄŤne poti',
		title: 'ZaÄŤni z veÄŤjo sliko.',
		description: 'UÄŤna pot ti pokaĹľe celotno smer uÄŤenja. Namesto posameznih nepovezanih vsebin vidiĹˇ zaporedje korakov, ki te vodijo proti jasnemu cilju.',
		cards: [
			{ title: 'Pregled', front: 'VidiĹˇ celotno pot', back: 'UÄŤna pot zdruĹľi module in uÄŤne enote v logiÄŤno zaporedje.' },
			{ title: 'Usmeritev', front: 'LaĹľje izbereĹˇ zaÄŤetek', back: 'Pomaga ti razumeti, katero podroÄŤje je zate najbolj smiselno.' },
		],
	},
	{
		id: 'modules',
		eyebrow: 'Moduli',
		title: 'VeÄŤjo pot razdeli na razumljive korake.',
		description: 'Modul predstavlja zaokroĹľen del uÄŤne poti. Vsak modul ima svoj namen, zato laĹľje slediĹˇ napredku in razumeĹˇ, kaj posamezen korak prinese.',
		cards: [
			{ title: 'Korak', front: 'ManjĹˇi del veÄŤje poti', back: 'Modul razdeli ĹˇirĹˇe podroÄŤje na bolj obvladljive vsebinske sklope.' },
			{ title: 'Napredek', front: 'SlediĹˇ svojemu tempu', back: 'Vsak modul ti pomaga videti, kaj si Ĺľe pregledal in kaj Ĺˇe sledi.' },
		],
	},
	{
		id: 'learning-units',
		eyebrow: 'UÄŤne enote',
		title: 'UÄŤi se skozi kratke in konkretne vsebine.',
		description: 'UÄŤna enota je najmanjĹˇi del strukture. Namenjena je hitremu pregledu konkretnega znanja, spretnosti ali aktivnosti znotraj modula.',
		cards: [
			{ title: 'Fokus', front: 'Ena vsebina naenkrat', back: 'Vsaka uÄŤna enota predstavi jasen in omejen del znanja.' },
			{ title: 'Samostojnost', front: 'PregledaĹˇ jo lahko posebej', back: 'Enote lahko raziskujeĹˇ znotraj modula ali kot samostojen vir.' },
		],
	},
	{
		id: 'questionnaire',
		eyebrow: 'VpraĹˇalnik',
		title: 'Preveri, kje si trenutno.',
		description: 'VpraĹˇalnik ti pomaga oceniti trenutno znanje in prepoznati podroÄŤja, kjer imaĹˇ najveÄŤ prostora za napredek.',
		cards: [
			{ title: 'Samoocena', front: 'RazumeĹˇ svoje izhodiĹˇÄŤe', back: 'Odgovori pokaĹľejo, katera podroÄŤja Ĺľe poznaĹˇ in katera potrebujejo veÄŤ pozornosti.' },
			{ title: 'PriporoÄŤilo', front: 'DobiĹˇ bolj jasno smer', back: 'Rezultat ti pomaga izbrati primernejĹˇo pot, modul ali naslednjo vsebino.' },
		],
	},
]


