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
  const area = code.trim().charAt(0)

  if (area === '1') {
    return {
      code: 'text-[#2f6f9f] bg-[#eef7fb] border-[#c9e2ed]',
      title: 'text-[#24576f]',
    }
  }

  if (area === '2') {
    return {
      code: 'text-[#8a5a18] bg-[#fff4e6] border-[#efd3a9]',
      title: 'text-[#7a470b]',
    }
  }

  if (area === '3') {
    return {
      code: 'text-[#d07a12] bg-[#fff4e6] border-[#efd3a9]',
      title: 'text-[#8a5a18]',
    }
  }

  if (area === '4') {
    return {
      code: 'text-[#9a4b42] bg-[#fbefee] border-[#e7c7c4]',
      title: 'text-[#74302b]',
    }
  }

  if (area === '5') {
    return {
      code: 'text-[#2f6f9f] bg-[#eef7fb] border-[#c9e2ed]',
      title: 'text-[#24576f]',
    }
  }

  return {
    code: 'text-[#d07a12] bg-[#fff4e6] border-[#eadfce]',
    title: 'text-[#2f3328]',
  }
}

function LearningUnitDetailContent({
  learningUnit,
}: LearningUnitDetailContentProps) {
  const [activeSection, setActiveSection] =
    useState<DetailContentSection>('topics')

  return (
    <section className="rounded-[16px] border border-[#eadfce] bg-[#fffdf8] p-0 shadow-[0_10px_30px_rgba(57,47,35,0.05)]">
      <div className="border-b border-[#eadfce] px-6 py-5">
        <h2 className="font-serif text-2xl text-[#111111]">
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

                  <span className="text-[15px] font-semibold leading-snug">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="min-h-[340px] px-6 py-6">
          {activeSection === 'topics' && (
            <div>
              <div className="mb-6 flex items-center gap-4">
                <BookOpen className="h-7 w-7 text-[#d07a12]" />

                <div>
                  <h3 className="font-serif text-2xl text-[#111111]">
                    Vsebinski sklopi
                  </h3>
                  <p className="mt-1 text-sm text-[#706b60]">
                    Pregled ključnih vsebinskih tem, ki jih boste spoznali v tej
                    učni enoti.
                  </p>
                </div>
              </div>

              <div className="relative max-w-[760px] space-y-0">
                <div className="absolute bottom-8 left-[20px] top-8 w-px bg-[#eadfce]" />

                {learningUnit.content_topics.map((topic, index) => (
                  <div key={topic} className="relative flex gap-5 pb-6">
                    <span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eadfce] bg-[#f7eadb] text-sm font-bold text-[#111111]">
                      {index + 1}
                    </span>

                    <div className="border-b border-[#eadfce] pb-5">
                      <h4 className="font-semibold text-[#111111]">{topic}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'competencies' && (
            <div>
              <div className="mb-6 flex items-center gap-4">
                <Star className="h-7 w-7 text-[#d07a12]" />

                <div>
                  <h3 className="font-serif text-2xl text-[#111111]">
                    Pridobljene kompetence
                  </h3>
                  <p className="mt-1 text-sm text-[#706b60]">
                    Kaj bo uporabnik znal po zaključku učne enote.
                  </p>
                </div>
              </div>

              <ul className="grid gap-3">
                {learningUnit.acquired_competencies.map((competency) => (
                  <li
                    key={competency}
                    className="flex gap-3 rounded-[12px] border border-[#eadfce] bg-[#fffaf5] px-4 py-4 text-[#5d5a55]"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#31583b]" />
                    <span>{competency}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === 'digcomp' && (
            <div>
              <div className="mb-6 flex items-center gap-4">
                <Monitor className="h-7 w-7 text-[#d07a12]" />

                <div>
                  <h3 className="font-serif text-2xl text-[#111111]">
                    DigComp kompetence
                  </h3>
                  <p className="mt-1 text-sm text-[#706b60]">
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
                      className={`grid overflow-hidden rounded-[14px] border bg-[#fffdf8] md:grid-cols-[110px_minmax(0,1fr)] ${color.code}`}
                    >
                      <div className="flex items-center justify-center border-b border-inherit p-5 md:border-b-0 md:border-r">
                        <span className="text-4xl font-bold">
                          {competency.code}
                        </span>
                      </div>

                      <div className="p-5">
                        <h4 className={`font-bold ${color.title}`}>
                          {competency.title}
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-[#5d5a55]">
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
              <div className="mb-6 flex items-center gap-4">
                <GraduationCap className="h-7 w-7 text-[#d07a12]" />

                <div>
                  <h3 className="font-serif text-2xl text-[#111111]">
                    Predznanje
                  </h3>
                  <p className="mt-1 text-sm text-[#706b60]">
                    Priporočeni pogoji za vključitev.
                  </p>
                </div>
              </div>

              {learningUnit.prerequisites.length > 0 ? (
                <ul className="grid gap-3">
                  {learningUnit.prerequisites.map((prerequisite) => (
                    <li
                      key={prerequisite}
                      className="rounded-[12px] border border-[#eadfce] bg-[#fffaf5] px-4 py-4 text-[#5d5a55]"
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