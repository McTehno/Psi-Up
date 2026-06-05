import { BookOpen, Flag, Mountain } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { LearningPathMountainNode } from './LearningPathMountain'

type LearningPathMobileStepsProps = {
  title: string
  description: string
  targetLabel?: string
  nodes: LearningPathMountainNode[]
}

export function LearningPathMobileSteps({
  title,
  description,
  targetLabel,
  nodes,
}: LearningPathMobileStepsProps) {
  const orderedNodes = nodes.slice().sort((a, b) => a.order - b.order)

  return (
    <section className="rounded-[2rem] border border-[#DED2BC] bg-[#F7F1E6] p-4 shadow-sm">
      <div className="rounded-[1.5rem] bg-white/90 p-5 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4EEE4] text-[#31583B]">
          <Mountain className="h-6 w-6" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6F7F58]">
          Učna pot
        </p>

        <h1 className="mt-2 text-2xl font-bold leading-tight text-[#283618]">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#5F6652]">
          {description}
        </p>

        {targetLabel && (
          <div className="mt-4 inline-flex rounded-full bg-[#F7F1E6] px-4 py-2 text-xs font-semibold text-[#344E41]">
            Fokus: {targetLabel}
          </div>
        )}
      </div>

      <div className="relative mt-6">
        <div className="absolute bottom-12 left-6 top-6 w-1 rounded-full bg-[#D7C9B4]" />

        <div className="space-y-5">
          {orderedNodes.map((node, index) => (
            <Link
              key={node.id}
              to={`/modules/${node.moduleId}`}
              className="group relative grid grid-cols-[3rem_minmax(0,1fr)] gap-4"
              aria-label={`Odpri modul ${node.title}`}
            >
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#F8E7BE] bg-[#344E41] text-base font-bold text-white shadow-md transition duration-200 group-hover:scale-105 group-hover:bg-[#5F6F52]">
                {node.order}
              </div>

              <article
                className={`rounded-3xl border border-[#E1D4BF] bg-white p-5 shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md ${
                  index % 2 === 1 ? 'sm:mr-8' : ''
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8F72]">
                  Stopnja {node.order}
                </p>

                <h2 className="mt-2 text-lg font-bold leading-snug text-[#4B3027]">
                  {node.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#756F65]">
                  {node.description}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#31583B]">
                  <BookOpen className="h-4 w-4" />
                  Odpri modul
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-[3rem_minmax(0,1fr)] gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#D9A441] text-white shadow-md">
            <Flag className="h-5 w-5" />
          </div>

          <div className="rounded-3xl border border-[#E1D4BF] bg-white p-5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8F72]">
              Zaključek poti
            </p>

            <p className="mt-1 text-lg font-bold text-[#4B3027]">
              Cilj dosežen
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

