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
		title: 'Vpra≈°alnik',
		text: 'Poka≈æe izhodi≈°ƒçe.',
	},
	{
		icon: Compass,
		title: 'Priporoƒçilo',
		text: 'Uredi naslednji korak.',
	},
	{
		icon: Target,
		title: 'Napredek',
		text: 'Dr≈æi smer do cilja.',
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
		description: 'Za≈°ƒçita naprav, podatkov, zasebnosti in zdravja.',
		themeBg: 'bg-[#4AAA4B]',
		themeText: 'text-white',
		svgFill: '#4AAA4B',
	},
	{
		title: 'Prepoznavanje in re≈°evanje te≈æav',
		icon: Lightbulb,
		description: 'Prepoznavanje logiƒçnih potreb in re≈°evanje tehniƒçnih izzivov.',
		themeBg: 'bg-[#F05A4E]',
		themeText: 'text-white',
		svgFill: '#F05A4E',
	},
] as const

export const learningPathCards = [
	{
		icon: Map,
		title: 'Preglej izbrano uƒçno pot',
		text: 'Najprej si ogleda≈°, kaj pot vkljuƒçuje: module, uƒçne enote, kompetence in vsebine, ki te vodijo proti cilju.',
	},
	{
		icon: Target,
		title: 'Zaƒçni iz svoje pozicije',
		text: 'Ni treba zaƒçeti od zaƒçetka. Pomembno je razumeti, kaj ≈æe zna≈°, kaj ≈°e potrebuje≈° in kje je tvoj najbolj smiseln naslednji korak.',
	},
] as const

export const positionCards = [
	{
		icon: ClipboardList,
		title: 'Izpolni vpra≈°alnik',
		text: 'Vpra≈°anja so povezana z vsebino izbrane uƒçne poti. Pomagajo oceniti tvoje trenutno znanje znotraj poti, ki te zanima.',
	},
	{
		icon: Compass,
		title: 'Odkrij svojo pozicijo',
		text: 'Rezultat poka≈æe, katere dele poti ≈æe obvlada≈° in katera podroƒçja je dobro ≈°e utrditi, preden nadaljuje≈°.',
	},
] as const

export const flowSteps = [
	'Izbira poti',
	'Pregled vsebine',
	'Vpra≈°alnik',
	'Tvoja pozicija',
	'Naslednji korak',
] as const

export const searchFilters = [
	{ label: 'Vse', value: null },
	{ label: 'Moduli', value: 'module' },
	{ label: 'Uƒçne poti', value: 'learning_path' },
	{ label: 'Uƒçne enote', value: 'learning_unit' },
] as const
export const STORY_SECTIONS_DATA = [
	{
		id: 'learning-paths',
		eyebrow: 'Ucne poti',
		title: 'Zacni z vecjo sliko.',
		description: 'Ucna pot ti pokaûe celotno smer ucenja. Namesto posameznih nepovezanih vsebin vidiö zaporedje korakov, ki te vodijo proti jasnemu cilju.',
		cards: [
			{ title: 'Pregled', front: 'Vidiö celotno pot', back: 'Ucna pot zdruûi module in ucne enote v logicno zaporedje.' },
			{ title: 'Usmeritev', front: 'Laûje izbereö zacetek', back: 'Pomaga ti razumeti, katero podrocje je zate najbolj smiselno.' },
		],
	},
	{
		id: 'modules',
		eyebrow: 'Moduli',
		title: 'Vecjo pot razdeli na razumljive korake.',
		description: 'Modul predstavlja zaokroûen del ucne poti. Vsak modul ima svoj namen, zato laûje slediö napredku in razumeö, kaj posamezen korak prinese.',
		cards: [
			{ title: 'Korak', front: 'Manjöi del vecje poti', back: 'Modul razdeli öiröe podrocje na bolj obvladljive vsebinske sklope.' },
			{ title: 'Napredek', front: 'Slediö svojemu tempu', back: 'Vsak modul ti pomaga videti, kaj si ûe pregledal in kaj öe sledi.' },
		],
	},
	{
		id: 'learning-units',
		eyebrow: 'Ucne enote',
		title: 'Uci se skozi kratke in konkretne vsebine.',
		description: 'Ucna enota je najmanjöi del strukture. Namenjena je hitremu pregledu konkretnega znanja, spretnosti ali aktivnosti znotraj modula.',
		cards: [
			{ title: 'Fokus', front: 'Ena vsebina naenkrat', back: 'Vsaka ucna enota predstavi jasen in omejen del znanja.' },
			{ title: 'Samostojnost', front: 'Pregledaö jo lahko posebej', back: 'Enote lahko raziskujeö znotraj modula ali kot samostojen vir.' },
		],
	},
	{
		id: 'questionnaire',
		eyebrow: 'Vpraöalnik',
		title: 'Preveri, kje si trenutno.',
		description: 'Vpraöalnik ti pomaga oceniti trenutno znanje in prepoznati podrocja, kjer imaö najvec prostora za napredek.',
		cards: [
			{ title: 'Samoocena', front: 'Razumeö svoje izhodiöce', back: 'Odgovori pokaûejo, katera podrocja ûe poznaö in katera potrebujejo vec pozornosti.' },
			{ title: 'Priporocilo', front: 'Dobiö bolj jasno smer', back: 'Rezultat ti pomaga izbrati primernejöo pot, modul ali naslednjo vsebino.' },
		],
	},
]
