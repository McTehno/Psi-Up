import { useState } from 'react'
import type { ComponentType } from 'react'
import {
	BookOpen,
	CheckCircle2,
	ChevronDown,
	GraduationCap,
	Monitor,
	Star,
} from 'lucide-react'

import { appStyles } from '../../../design'
import type { LearningUnitResponse } from '../../../types/learning-unit'
import type { AssessmentResultResponse } from '../../../types/assessment'
import { getArrayOrEmpty, getTextOrFallback } from '../../../utils/display'

/**
 * LearningUnitDetailContent prikazuje vsebinski pregled učne enote.
 *
 * Namen komponente:
 * - prikaz vsebinskih sklopov
 * - prikaz pridobljenih kompetenc
 * - prikaz DigComp kompetenc
 * - prikaz predznanja
 * - označevanje vsebinskih sklopov glede na rezultat samoocene
 *
 * Zakaj uporabljamo varne helperje:
 * Backend lahko vrne manjkajoče, null ali delno nepopolne podatke.
 * Zato sezname najprej pretvorimo v varne array-e, preden uporabimo .map().
 *
 * S tem preprečimo napake, kot so:
 * Cannot read properties of undefined
 * Cannot read properties of null
 */

type LearningUnitDetailContentProps = {
	learningUnit: LearningUnitResponse
	assessmentResult?: AssessmentResultResponse | null
	isCompleted?: boolean
	manualCompletionOverride?: boolean | null
}

type DetailContentSection =
	| 'topics'
	| 'competencies'
	| 'digcomp'
	| 'prerequisites'

type MenuItem = {
	id: DetailContentSection
	label: string
	icon: ComponentType<{ className?: string }>
}

type TopicAssessmentStatus = 'known' | 'focus' | 'missing' | 'default'

type SafeDigCompCompetency = {
	code: string
	title: string
	description: string
}
type SafeContentTopic = {
	id: string
	title: string
	relatedCompetencyCodes: string[]
}

const menuItems: MenuItem[] = [
	{
		id: 'topics',
		label: 'Vsebinski sklopi',
		icon: BookOpen,
	},
	{
		id: 'competencies',
		label: 'Pridobljene kompetence',
		icon: Star,
	},
	{
		id: 'digcomp',
		label: 'DigComp kompetence',
		icon: Monitor,
	},
	{
		id: 'prerequisites',
		label: 'Predznanje',
		icon: GraduationCap,
	},
]

/**
 * Vrne samo veljavne string vrednosti.
 *
 * Uporaba:
 * - content_topics
 * - acquired_competencies
 * - prerequisites
 * - known_topics
 * - missing_topics
 *
 * ÄŚe backend pošlje null, undefined ali ne-string vrednosti,
 * jih ne prikaĹľemo.
 */
function getStringArrayOrEmpty(value: unknown): string[] {
	return getArrayOrEmpty(value as string[])
		.filter((item): item is string => typeof item === 'string')
		.map((item) => item.trim())
		.filter(Boolean)
}

/**
 * Normalizira DigComp kompetence.
 *
 * Namen:
 * - preprečiti crash, če digcomp_competencies manjka
 * - zagotoviti fallback za code, title ali description
 * - preskočiti elemente, ki niso objekti
 */
function getSafeDigCompCompetencies(value: unknown): SafeDigCompCompetency[] {
	return getArrayOrEmpty(value as Record<string, unknown>[])
		.filter(
			(item): item is Record<string, unknown> =>
				Boolean(item) && typeof item === 'object' && !Array.isArray(item),
		)
		.map((item) => ({
			code: getTextOrFallback(
				typeof item.code === 'string' ? item.code : undefined,
				'â€“',
			),
			title: getTextOrFallback(
				typeof item.title === 'string' ? item.title : undefined,
				'Neimenovana kompetenca',
			),
			description: getTextOrFallback(
				typeof item.description === 'string' ? item.description : undefined,
				'Opis kompetence trenutno ni na voljo.',
			),
		}))
}
/**
 * Vrne varne vsebinske sklope.
 * 	
 * 	
 * 	
 *Namen:
 * - preprečiti crash, če content_topics manjka
 * - zagotoviti fallback za id in title
 * - preskočiti elemente, ki niso objekti
 */

function getSafeContentTopics(value: unknown): SafeContentTopic[] {
	return getArrayOrEmpty(value as Record<string, unknown>[])
		.filter(
			(item): item is Record<string, unknown> =>
				Boolean(item) && typeof item === 'object' && !Array.isArray(item),
		)
		.map((item) => ({
			id: getTextOrFallback(
				typeof item.id === 'string' ? item.id : undefined,
				'',
			),
			title: getTextOrFallback(
				typeof item.title === 'string' ? item.title : undefined,
				'Neimenovan vsebinski sklop',
			),
			relatedCompetencyCodes: getStringArrayOrEmpty(
				item.related_competency_codes,
			),
		}))
		.filter((topic) => topic.id || topic.title)
}


/**
 * Vrne mehke barve za DigComp področje glede na prvo številko kode.
 *
 * Primer:
 * 3.2 â†’ področje 3
 */
function getDigCompSoftColor(code: string) {
	const area = code.trim().match(/^(\d)\./)?.[1]

	if (area === '1') {
		return {
			code: 'text-[#7a5a12] bg-[#fff8df] border-[#eadfce]',
			title: 'text-[#6b4d0f]',
		}
	}

	if (area === '2') {
		return {
			code: 'text-[#31576b] bg-[#eef7fb] border-[#d6e4ee]',
			title: 'text-[#24495d]',
		}
	}

	if (area === '3') {
		return {
			code: 'text-[#8a531f] bg-[#fff1e4] border-[#ead8c5]',
			title: 'text-[#744116]',
		}
	}

	if (area === '4') {
		return {
			code: 'text-[#31583b] bg-[#f2f8f1] border-[#d8e8da]',
			title: 'text-[#284b31]',
		}
	}

	if (area === '5') {
		return {
			code: 'text-[#8a3f36] bg-[#fff0ee] border-[#ead3d0]',
			title: 'text-[#71322b]',
		}
	}

	return {
		code: 'text-[#5f513f] bg-[#fffdf8] border-[#eadfce]',
		title: 'text-[#2f3328]',
	}
}

/**
 * Določi status vsebinskega sklopa glede na rezultat samoocene.
 */
function getTopicAssessmentStatus(
	topic: string,
	knownTopics: string[],
	missingTopics: string[],
): TopicAssessmentStatus {
	if (knownTopics.includes(topic)) {
		return 'known'
	}

	if (missingTopics[0] === topic) {
		return 'focus'
	}

	if (missingTopics.includes(topic)) {
		return 'missing'
	}

	return 'default'
}

/**
 * Vrne stile in opis za prikaz statusa vsebinskega sklopa.
 */
function getTopicAssessmentStyle(status: TopicAssessmentStatus) {
	if (status === 'known') {
		return {
			row: 'border border-[#a8d2ad] bg-[#edf7ec]',
			circle: 'border-[#8fbe96] bg-white text-[#31583b]',
			text: 'text-[#31583b]',
			description: 'To področje Ĺľe dobro poznate.',
		}
	}

	if (status === 'focus') {
		return {
			row: 'border border-[#e3aaa4] bg-[#fff0ee]',
			circle: 'border-[#d58e86] bg-white text-[#8a3f36]',
			text: 'text-[#111111]',
			description: 'Največji fokus za utrditev.',
		}
	}

	if (status === 'missing') {
		return {
			row: 'border border-[#e3aaa4] bg-[#fff0ee]',
			circle: 'border-[#d58e86] bg-white text-[#8a3f36]',
			text: 'text-[#111111]',
			description: 'To področje je dobro še utrditi.',
		}
	}

	return {
		row: '',
		circle: 'border-[#eadfce] bg-[#f7eadb] text-[#111111]',
		text: 'text-[#111111]',
		description: '',
	}
}

function LearningUnitDetailContent({
	learningUnit,
	assessmentResult,
	isCompleted = false,
	manualCompletionOverride = null,
}: LearningUnitDetailContentProps) {
	const [activeSection, setActiveSection] =
		useState<DetailContentSection>('topics')
	const [openMobileSections, setOpenMobileSections] = useState<
		DetailContentSection[]
	>(['topics'])

	/**
	 * Varni podatki za prikaz.
	 *
	 * Ti array-i se uporabljajo namesto direktnega dostopa do backend polj.
	 * Tako komponenta ne pade, če backend vrne null ali manjkajoče polje.
	 */
	const contentTopics = getSafeContentTopics(learningUnit.content_topics)
	const acquiredCompetencies = getStringArrayOrEmpty(
		learningUnit.acquired_competencies,
	)
	const prerequisites = getStringArrayOrEmpty(learningUnit.prerequisites)
	const digCompCompetencies = getSafeDigCompCompetencies(
		learningUnit.digcomp_competencies,
	)

	const learningUnitAssessmentResult =
		assessmentResult?.learning_unit_results.find(
			(result) => result.learning_unit_id === learningUnit._id,
		) ?? null

	const shouldShowManualCompletion = manualCompletionOverride === true

	const shouldShowStoredAssessmentResult =
		manualCompletionOverride !== true && Boolean(learningUnitAssessmentResult)

	const shouldShowCompletedState =
		!learningUnitAssessmentResult && isCompleted

	const knownTopics =
		shouldShowManualCompletion || shouldShowCompletedState
			? contentTopics.map((topic) => topic.id).filter(Boolean)
			: shouldShowStoredAssessmentResult
				? getStringArrayOrEmpty(learningUnitAssessmentResult?.known_topic_ids)
				: []

	const missingTopics =
		shouldShowManualCompletion || shouldShowCompletedState
			? []
			: shouldShowStoredAssessmentResult
				? getStringArrayOrEmpty(learningUnitAssessmentResult?.missing_topic_ids)
				: []

	const showAssessmentResult =
		shouldShowManualCompletion ||
		shouldShowStoredAssessmentResult ||
		shouldShowCompletedState

	function renderSectionHeader({
		icon: Icon,
		title,
		description,
	}: {
		icon: ComponentType<{ className?: string }>
		title: string
		description: string
	}) {
		return (
			<div className="mb-6 flex items-start gap-3 sm:mb-7 sm:gap-4">
				<Icon className="mt-1 h-6 w-6 shrink-0 text-[#d07a12] sm:h-7 sm:w-7" />

				<div className="min-w-0">
					<h3 className="font-serif text-[24px] leading-tight text-[#111111] sm:text-[28px]">
						{title}
					</h3>
					<p className="mt-1 text-[15px] leading-6 text-[#706b60]">
						{description}
					</p>
				</div>
			</div>
		)
	}

	function renderTopics(showHeader = true) {
		return (
			<div>
				{showHeader &&
					renderSectionHeader({
						icon: BookOpen,
						title: 'Vsebinski sklopi',
						description:
							'Pregled ključnih vsebinskih tem, ki jih boste spoznali v tej učni enoti.',
					})}

				<div className="max-w-[820px]">
					{contentTopics.length > 0 ? (
						contentTopics.map((topic, index) => {
							const status = showAssessmentResult
								? getTopicAssessmentStatus(
									topic.id,
									knownTopics,
									missingTopics,
								)
								: 'default'

							const style = getTopicAssessmentStyle(status)

							return (
								<div
									key={topic.id || topic.title}
									className={[
										'flex items-start gap-3 px-3 py-4 sm:gap-5 sm:px-4 sm:py-5',
										style.row,
										showAssessmentResult ? 'rounded-[12px]' : '',
										index !== contentTopics.length - 1
											? 'mb-2 border-b border-[#eadfce]'
											: '',
									].join(' ')}
								>
									<span
										className={[
											'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold sm:h-10 sm:w-10',
											style.circle,
										].join(' ')}
									>
										{showAssessmentResult && status === 'known' ? (
											<CheckCircle2 className="h-5 w-5" />
										) : showAssessmentResult &&
											(status === 'focus' || status === 'missing') ? (
											'!'
										) : (
											index + 1
										)}
									</span>

									<div className="min-w-0 pt-0.5 sm:pt-1">
										<h4
											className={[
												'break-words text-[16px] font-semibold leading-7 sm:text-[17px]',
												style.text,
											].join(' ')}
										>
											{topic.title}
										</h4>

										{showAssessmentResult && status !== 'default' && (
											<p className="mt-1 text-[15px] leading-6 text-[#706b60]">
												{style.description}
											</p>
										)}
									</div>
								</div>
							)
						})
					) : (
						<p className={appStyles.text.body}>
							Vsebinski sklopi za to učno enoto trenutno niso določeni.
						</p>
					)}
				</div>
			</div>
		)
	}

	function renderCompetencies(showHeader = true) {
		return (
			<div>
				{showHeader &&
					renderSectionHeader({
						icon: Star,
						title: 'Pridobljene kompetence',
						description: 'Kaj bo uporabnik znal po zaključku učne enote.',
					})}

				{acquiredCompetencies.length > 0 ? (
					<ul className="grid gap-3">
						{acquiredCompetencies.map((competency) => (
							<li
								key={competency}
								className="flex min-w-0 gap-3 rounded-[12px] border border-[#eadfce] bg-[#fff6eb] px-4 py-4 text-[#5d5a55] shadow-[0_6px_16px_rgba(57,47,35,0.04)]"
							>
								<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#31583b]" />
								<span className="min-w-0 break-words text-[15px] leading-7 sm:text-[16px]">
									{competency}
								</span>
							</li>
						))}
					</ul>
				) : (
					<p className={appStyles.text.body}>
						Pridobljene kompetence za to učno enoto trenutno niso določene.
					</p>
				)}
			</div>
		)
	}

	function renderDigComp(showHeader = true) {
		return (
			<div>
				{showHeader &&
					renderSectionHeader({
						icon: Monitor,
						title: 'DigComp kompetence',
						description:
							'Ta učna enota prispeva k razvoju izbranih digitalnih kompetenc.',
					})}

				{digCompCompetencies.length > 0 ? (
					<div className="grid gap-4">
						{digCompCompetencies.map((competency) => {
							const color = getDigCompSoftColor(competency.code)

							return (
								<article
									key={`${competency.code}-${competency.title}`}
									className={`overflow-hidden rounded-[14px] border shadow-[0_6px_16px_rgba(57,47,35,0.04)] sm:grid sm:grid-cols-[100px_minmax(0,1fr)] ${color.code}`}
								>
									<div className="flex items-center justify-start border-b border-inherit px-4 py-3 sm:justify-center sm:border-b-0 sm:border-r sm:p-5">
										<span className="text-2xl font-bold sm:text-3xl">
											{competency.code}
										</span>
									</div>

									<div className="min-w-0 bg-white/35 p-4 sm:bg-transparent sm:p-5">
										<h4
											className={`break-words text-[16px] font-bold leading-snug sm:text-[17px] ${color.title}`}
										>
											{competency.title}
										</h4>

										<p className="mt-2 break-words text-[15px] leading-7 text-[#5d5a55]">
											{competency.description}
										</p>
									</div>
								</article>
							)
						})}
					</div>
				) : (
					<p className={appStyles.text.body}>
						DigComp kompetence za to učno enoto trenutno niso določene.
					</p>
				)}
			</div>
		)
	}

	function renderPrerequisites(showHeader = true) {
		return (
			<div>
				{showHeader &&
					renderSectionHeader({
						icon: GraduationCap,
						title: 'Predznanje',
						description: 'Priporočeni pogoji za vključitev.',
					})}

				{prerequisites.length > 0 ? (
					<ul className="grid gap-3">
						{prerequisites.map((prerequisite) => (
							<li
								key={prerequisite}
								className="min-w-0 break-words rounded-[12px] border border-[#eadfce] bg-[#fff6eb] px-4 py-4 text-[15px] leading-7 text-[#5d5a55] shadow-[0_6px_16px_rgba(57,47,35,0.04)] sm:text-[16px]"
							>
								{prerequisite}
							</li>
						))}
					</ul>
				) : (
					<p className={appStyles.text.body}>
						Za to učno enoto ni predpogojev.
					</p>
				)}
			</div>
		)
	}

	function renderSectionContent(
		section: DetailContentSection,
		showHeader = true,
	) {
		if (section === 'topics') {
			return renderTopics(showHeader)
		}

		if (section === 'competencies') {
			return renderCompetencies(showHeader)
		}

		if (section === 'digcomp') {
			return renderDigComp(showHeader)
		}

		return renderPrerequisites(showHeader)
	}

	function toggleMobileSection(section: DetailContentSection) {
		setOpenMobileSections((currentSections) =>
			currentSections.includes(section)
				? currentSections.filter((currentSection) => currentSection !== section)
				: [...currentSections, section],
		)
	}

	function renderMobileSection(item: MenuItem) {
		const isActive = openMobileSections.includes(item.id)
		const Icon = item.icon

		return (
			<article
				key={item.id}
				className={[
					'overflow-hidden rounded-[16px] border bg-[#fffdf8] shadow-[0_8px_22px_rgba(57,47,35,0.05)] transition-all duration-300 ease-out',
					isActive
						? 'border-[#d7c3a6] bg-[#fffaf2] shadow-[0_14px_34px_rgba(57,47,35,0.08)]'
						: 'border-[#eadfce] active:scale-[0.99]',
				].join(' ')}
			>
				<button
					type="button"
					onClick={() => toggleMobileSection(item.id)}
					className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
					aria-expanded={isActive}
				>
					<span className="flex min-w-0 items-center gap-3">
						<span
							className={[
								'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition duration-300',
								isActive
									? 'bg-[#fff4e6] text-[#d07a12]'
									: 'bg-[#f2f8f1] text-[#31583b]',
							].join(' ')}
						>
							<Icon className="h-5 w-5" />
						</span>

						<span className="min-w-0 text-[16px] font-bold text-[#111111]">
							{item.label}
						</span>
					</span>

					<ChevronDown
						className={[
							'h-5 w-5 shrink-0 text-[#706b60] transition-transform duration-300',
							isActive ? 'rotate-180 text-[#d07a12]' : '',
						].join(' ')}
					/>
				</button>

				<div
					className={[
						'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
						isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
					].join(' ')}
				>
					<div className="overflow-hidden">
						<div className="px-4 pb-4 pt-1">
							{renderSectionContent(item.id, false)}
						</div>
					</div>
				</div>
			</article>
		)
	}

	function renderActiveSection() {
		return renderSectionContent(activeSection)
	}

	return (
		<section className="lg:overflow-hidden lg:rounded-[16px] lg:border lg:border-[#eadfce] lg:bg-[#fffdf8] lg:p-0 lg:shadow-[0_10px_30px_rgba(57,47,35,0.05)]">
			<div className="hidden border-b border-[#eadfce] px-4 py-5 sm:px-6 sm:py-6 lg:block">
				<h2 className="font-serif text-2xl text-[#111111] sm:text-3xl">
					Pregled učne enote
				</h2>
			</div>

			<div className="grid gap-3 lg:hidden">
				{menuItems.map((item) => renderMobileSection(item))}
			</div>

			<div className="hidden gap-0 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
				<aside className="border-r border-[#eadfce] bg-[#fffdf8]">
					<nav className="flex flex-col">
						{menuItems.map((item) => {
							const isActive = activeSection === item.id
							const Icon = item.icon

							return (
								<button
									key={item.id}
									type="button"
									onClick={() => setActiveSection(item.id)}
									className={[
										'relative flex items-center gap-3 px-4 py-4 text-left transition',
										isActive
											? 'bg-[#fff4e6] text-[#111111] before:absolute before:left-0 before:top-0 before:h-full before:w-[4px] before:bg-[#d07a12]'
											: 'text-[#2f3328] hover:bg-[#fff8ef]',
									].join(' ')}
								>
									<Icon className="h-5 w-5 shrink-0 text-[#31583b]" />

									<span className="text-[16px] font-semibold leading-snug">
										{item.label}
									</span>
								</button>
							)
						})}
					</nav>
				</aside>

				<div className="min-h-[360px] min-w-0 px-7 py-7">
					{renderActiveSection()}
				</div>
			</div>
		</section>
	)
}

export default LearningUnitDetailContent

