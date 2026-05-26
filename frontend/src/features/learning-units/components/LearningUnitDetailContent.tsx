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

type LearningUnitDetailContentProps = {
	learningUnit: LearningUnitResponse
	assessmentResult?: AssessmentResultResponse | null
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


function getTopicAssessmentStyle(status: TopicAssessmentStatus) {
	if (status === 'known') {
		return {
			row: 'border border-[#a8d2ad] bg-[#edf7ec]',
			circle: 'border-[#8fbe96] bg-white text-[#31583b]',
			text: 'text-[#31583b]',
			description: 'To področje že dobro poznate.',
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
}: LearningUnitDetailContentProps) {
	const [activeSection, setActiveSection] =
		useState<DetailContentSection>('topics')
	const [openMobileSections, setOpenMobileSections] = useState<
		DetailContentSection[]
	>(['topics'])

	const learningUnitAssessmentResult =
		assessmentResult?.learning_unit_results.find(
			(result) => result.learning_unit_id === learningUnit._id,
		) ?? null

	const showAssessmentResult = Boolean(learningUnitAssessmentResult)

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
					{learningUnit.content_topics.map((topic, index) => {
						const status = learningUnitAssessmentResult
							? getTopicAssessmentStatus(
								topic,
								learningUnitAssessmentResult.known_topics,
								learningUnitAssessmentResult.missing_topics,
							)
							: 'default'

						const style = getTopicAssessmentStyle(status)

						return (
							<div
								key={topic}
								className={[
									'flex items-start gap-3 px-3 py-4 sm:gap-5 sm:px-4 sm:py-5',
									style.row,
									showAssessmentResult ? 'rounded-[12px]' : '',
									index !== learningUnit.content_topics.length - 1
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
										{topic}
									</h4>

									{showAssessmentResult && status !== 'default' && (
										<p className="mt-1 text-[15px] leading-6 text-[#706b60]">
											{style.description}
										</p>
									)}
								</div>
							</div>
						)
					})}
				</div>
			</div>
		)
	}

	function renderCompetencies(showHeader = true) {
		return (
			<div>
				{showHeader && renderSectionHeader({
					icon: Star,
					title: 'Pridobljene kompetence',
					description: 'Kaj bo uporabnik znal po zaključku učne enote.',
				})}

				<ul className="grid gap-3">
					{learningUnit.acquired_competencies.map((competency) => (
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
			</div>
		)
	}

	function renderDigComp(showHeader = true) {
		return (
			<div>
				{showHeader && renderSectionHeader({
					icon: Monitor,
					title: 'DigComp kompetence',
					description:
						'Ta učna enota prispeva k razvoju izbranih digitalnih kompetenc.',
				})}

				<div className="grid gap-4">
					{learningUnit.digcomp_competencies.map((competency) => {
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
			</div>
		)
	}

	function renderPrerequisites(showHeader = true) {
		return (
			<div>
				{showHeader && renderSectionHeader({
					icon: GraduationCap,
					title: 'Predznanje',
					description: 'Priporočeni pogoji za vključitev.',
				})}

				{learningUnit.prerequisites.length > 0 ? (
					<ul className="grid gap-3">
						{learningUnit.prerequisites.map((prerequisite) => (
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
						Za to učno enoto ni navedenih posebnih pogojev.
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
					'overflow-hidden rounded-[16px] border bg-[#fffdf8] shadow-[0_8px_22px_rgba(57,47,35,0.05)] transition duration-300',
					isActive
						? 'border-[#d7c3a6] bg-[#fffaf2]'
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