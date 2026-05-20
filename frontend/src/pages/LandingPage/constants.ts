import {
	BookOpenIcon,
	CompassIcon,
	TargetIcon,
	UserIcon,
	LeafIcon,
	SearchIcon,
	UsersIcon,
	EditIcon,
	ShieldIcon,
	LightbulbIcon,
} from '../../components/ui/Icons'

export const focusTags = ['Personalizirano', 'Mirno', 'Jasno'] as const

export const processSteps = [
	{
		icon: BookOpenIcon,
		title: 'Vprašalnik',
		text: 'Pokaže izhodišče.',
	},
	{
		icon: CompassIcon,
		title: 'Priporočilo',
		text: 'Uredi naslednji korak.',
	},
	{
		icon: TargetIcon,
		title: 'Napredek',
		text: 'Drži smer do cilja.',
	},
] as const

export const outcomeCards = [
	{ icon: LeafIcon, title: 'Predznanje' },
	{ icon: TargetIcon, title: 'Cilj' },
	{ icon: UserIcon, title: 'Vloga' },
	{ icon: CompassIcon, title: 'DigComp' },
] as const

export const digcompAreas = [
	{
		title: 'Iskanje, vrednotenje in upravljanje',
		icon: SearchIcon,
		description: 'Iskanje, vrednotenje in upravljanje podatkov ter informacij.',
		themeBg: 'bg-[#FACA3A]',
		themeText: 'text-white',
		svgFill: '#FACA3A',
	},
	{
		title: 'Komunikacija in sodelovanje',
		icon: UsersIcon,
		description: 'Interakcija, deljenje in sodelovanje v digitalnem okolju.',
		themeBg: 'bg-[#4888C9]',
		themeText: 'text-white',
		svgFill: '#4888C9',
	},
	{
		title: 'Ustvarjanje digitalnih vsebin',
		icon: EditIcon,
		description: 'Razvoj, integracija in obdelava digitalnih virov.',
		themeBg: 'bg-[#F29111]',
		themeText: 'text-white',
		svgFill: '#F29111',
	},
	{
		title: 'Varnost in odgovorna raba',
		icon: ShieldIcon,
		description: 'Zaščita naprav, podatkov, zasebnosti in zdravja.',
		themeBg: 'bg-[#4AAA4B]',
		themeText: 'text-white',
		svgFill: '#4AAA4B',
	},
	{
		title: 'Prepoznavanje in reševanje težav',
		icon: LightbulbIcon,
		description: 'Prepoznavanje logičnih potreb in reševanje tehničnih izzivov.',
		themeBg: 'bg-[#F05A4E]',
		themeText: 'text-white',
		svgFill: '#F05A4E',
	},
] as const

export const searchFilters = ['Vse', 'Moduli', 'Učne poti', 'Učne enote'] as const