import { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Monitor,
  Star,
} from 'lucide-react'

import { appStyles } from '../../../design'
import type { LearningUnitResponse } from '../../../types/learning-unit'

type LearningUnitDetailContentProps = {
  learningUnit: LearningUnitResponse
}

type DetailContentSection =
  | 'topics'
  | 'competencies'
  | 'digcomp'
  | 'prerequisites'

type MenuItem = {
  id: DetailContentSection
  label: string
  icon: React.ComponentType<{ className?: string }>
}

type TopicAssessmentStatus = 'known' | 'focus' | 'missing' | 'default'

const demoAssessmentResult = {
  learning_unit_id: 'ue_005',
  known_topics: [
    'Razumevanje in učinkovita uporaba programskega vmesnika',
    'Shranjevanje in odpiranje datotek v različnih formatih',
  ],
  missing_topics: ['Vnašanje, urejanje in hramba podatkov'],
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

function shouldShowDemoAssessmentResult(learningUnit: LearningUnitResponse) {
  return learningUnit._id === demoAssessmentResult.learning_unit_id
}

function getTopicAssessmentStatus(topic: string): TopicAssessmentStatus {
  if (demoAssessmentResult.known_topics.includes(topic)) {
    return 'known'
  }

  if (demoAssessmentResult.missing_topics[0] === topic) {
    return 'focus'
  }

  if (demoAssessmentResult.missing_topics.includes(topic)) {
    return 'missing'
  }

  return 'default'
}

function getTopicAssessmentStyle(status: TopicAssessmentStatus) {
  if (status === 'known') {
    return {
      row: 'bg-[#f2f8f1]',
      circle: 'border-[#d8e8da] bg-white text-[#31583b]',
      text: 'text-[#31583b]',
      description: 'To področje že dobro poznate.',
    }
  }

  if (status === 'focus') {
    return {
      row: 'bg-[#fff0ee]',
      circle: 'border-[#ead3d0] bg-white text-[#8a3f36]',
      text: 'text-[#111111]',
      description: 'Največji fokus za utrditev.',
    }
  }

  if (status === 'missing') {
    return {
      row: 'bg-[#fff0ee]',
      circle: 'border-[#ead3d0] bg-white text-[#8a3f36]',
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
}: LearningUnitDetailContentProps) {
  const [activeSection, setActiveSection] =
    useState<DetailContentSection>('topics')

  const showAssessmentResult = shouldShowDemoAssessmentResult(learningUnit)

  return (
    <section className="rounded-[16px] border border-[#eadfce] bg-[#fffdf8] p-0 shadow-[0_10px_30px_rgba(57,47,35,0.05)]">
      <div className="border-b border-[#eadfce] px-6 py-6">
        <h2 className="font-serif text-3xl text-[#111111]">
          Pregled učne enote
        </h2>
      </div>

      <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-[#eadfce] bg-[#fffdf8] lg:border-b-0 lg:border-r">
          <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:gap-0 lg:overflow-visible lg:p-0">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={[
                    'relative flex min-w-[190px] items-center gap-3 rounded-[12px] px-4 py-4 text-left transition lg:min-w-0 lg:rounded-none',
                    isActive
                      ? 'bg-[#fff4e6] text-[#111111] lg:before:absolute lg:before:left-0 lg:before:top-0 lg:before:h-full lg:before:w-[4px] lg:before:bg-[#d07a12]'
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

        <div className="min-h-[360px] px-7 py-7">
          {activeSection === 'topics' && (
            <div>
              <div className="mb-7 flex items-center gap-4">
                <BookOpen className="h-7 w-7 text-[#d07a12]" />

                <div>
                  <h3 className="font-serif text-[28px] text-[#111111]">
                    Vsebinski sklopi
                  </h3>
                  <p className="mt-1 text-[15px] leading-6 text-[#706b60]">
                    Pregled ključnih vsebinskih tem, ki jih boste spoznali v tej
                    učni enoti.
                  </p>
                </div>
              </div>

              <div className="max-w-[820px]">
                {learningUnit.content_topics.map((topic, index) => {
                  const status = showAssessmentResult
                    ? getTopicAssessmentStatus(topic)
                    : 'default'
                  const style = getTopicAssessmentStyle(status)

                  return (
                    <div
                      key={topic}
                      className={[
                        'flex items-start gap-5 px-4 py-5',
                        style.row,
                        showAssessmentResult ? 'rounded-[12px]' : '',
                        index !== learningUnit.content_topics.length - 1
                          ? 'mb-2 border-b border-[#eadfce]'
                          : '',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold',
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

                      <div className="pt-1">
                        <h4
                          className={[
                            'text-[17px] font-semibold leading-7',
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
          )}

          {activeSection === 'competencies' && (
            <div>
              <div className="mb-7 flex items-center gap-4">
                <Star className="h-7 w-7 text-[#d07a12]" />

                <div>
                  <h3 className="font-serif text-[28px] text-[#111111]">
                    Pridobljene kompetence
                  </h3>
                  <p className="mt-1 text-[15px] leading-6 text-[#706b60]">
                    Kaj bo uporabnik znal po zaključku učne enote.
                  </p>
                </div>
              </div>

              <ul className="grid gap-3">
                {learningUnit.acquired_competencies.map((competency) => (
                  <li
                    key={competency}
                    className="flex gap-3 rounded-[12px] border border-[#eadfce] bg-[#fff6eb] px-4 py-4 text-[#5d5a55] shadow-[0_6px_16px_rgba(57,47,35,0.04)]"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#31583b]" />
                    <span className="text-[16px] leading-7">{competency}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === 'digcomp' && (
            <div>
              <div className="mb-7 flex items-center gap-4">
                <Monitor className="h-7 w-7 text-[#d07a12]" />

                <div>
                  <h3 className="font-serif text-[28px] text-[#111111]">
                    DigComp kompetence
                  </h3>
                  <p className="mt-1 text-[15px] leading-6 text-[#706b60]">
                    Ta učna enota prispeva k razvoju izbranih digitalnih
                    kompetenc.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {learningUnit.digcomp_competencies.map((competency) => {
                  const color = getDigCompSoftColor(competency.code)

                  return (
                    <article
                      key={`${competency.code}-${competency.title}`}
                      className={`grid overflow-hidden rounded-[14px] border md:grid-cols-[110px_minmax(0,1fr)] ${color.code}`}
                    >
                      <div className="flex items-center justify-center border-b border-inherit p-5 md:border-b-0 md:border-r">
                        <span className="text-4xl font-bold">
                          {competency.code}
                        </span>
                      </div>

                      <div className="p-5">
                        <h4 className={`text-[17px] font-bold ${color.title}`}>
                          {competency.title}
                        </h4>

                        <p className="mt-2 text-[15px] leading-7 text-[#5d5a55]">
                          {competency.description}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}

          {activeSection === 'prerequisites' && (
            <div>
              <div className="mb-7 flex items-center gap-4">
                <GraduationCap className="h-7 w-7 text-[#d07a12]" />

                <div>
                  <h3 className="font-serif text-[28px] text-[#111111]">
                    Predznanje
                  </h3>
                  <p className="mt-1 text-[15px] leading-6 text-[#706b60]">
                    Priporočeni pogoji za vključitev.
                  </p>
                </div>
              </div>

              {learningUnit.prerequisites.length > 0 ? (
                <ul className="grid gap-3">
                  {learningUnit.prerequisites.map((prerequisite) => (
                    <li
                      key={prerequisite}
                      className="rounded-[12px] border border-[#eadfce] bg-[#fff6eb] px-4 py-4 text-[16px] leading-7 text-[#5d5a55] shadow-[0_6px_16px_rgba(57,47,35,0.04)]"
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
          )}
        </div>
      </div>
    </section>
  )
}

export default LearningUnitDetailContent