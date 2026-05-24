import { Link } from 'react-router-dom'
import mountainJourneyBg from '../../../assets/mountain-journey-bg.png'
import type { LearningPathData, Module } from '../../../types/domain'

type LearningPathMountainProps = {
  data: LearningPathData
  className?: string
}

type MountainNode = {
  id: string
  order: number
  title: string
  description: string
  learningUnitId: string
  left: string
  top: string
}

const nodePositions = [
  { left: '18%', top: '73%' },
  { left: '34%', top: '61%' },
  { left: '50%', top: '47%' },
  { left: '65%', top: '33%' },
  { left: '78%', top: '19%' },
]

function createLearningUnitId(module: Module, index: number) {
  if (module.id.startsWith('ue_')) {
    return module.id
  }

  return `ue_${String(index + 1).padStart(3, '0')}`
}

function createMountainNodes(modules: Module[]): MountainNode[] {
  return modules.map((module, index) => {
    const position = nodePositions[index % nodePositions.length]

    return {
      id: module.id,
      order: module.order,
      title: module.title,
      description: module.description,
      learningUnitId: createLearningUnitId(module, index),
      left: position.left,
      top: position.top,
    }
  })
}

export function LearningPathMountain({
  data,
  className = '',
}: LearningPathMountainProps) {
  const nodes = createMountainNodes(data.modules)

  return (
    <section
      className={`relative h-full min-h-[680px] overflow-hidden rounded-[2rem] border border-[#DED2BC] bg-[#EFE2CC] shadow-sm ${className}`}
    >
      <img
        src={mountainJourneyBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-[#344E41]/20" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 16 75 C 25 67, 28 63, 34 61 C 42 55, 45 51, 50 47 C 57 41, 60 37, 65 33 C 72 26, 75 22, 78 19"
          fill="none"
          stroke="#F8E7BE"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="absolute left-6 top-6 z-20 max-w-xl rounded-3xl bg-white/88 p-6 shadow-md backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6F7F58]">
          Učna pot
        </p>

        <h1 className="mt-2 text-3xl font-bold leading-tight text-[#283618] xl:text-4xl">
          {data.pathTitle}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#5F6652] xl:text-base">
          {data.pathDescription}
        </p>

        <div className="mt-4 inline-flex rounded-full bg-[#F7F1E6] px-4 py-2 text-sm font-semibold text-[#344E41]">
          Cilj: {data.targetCompetency}
        </div>
      </div>

      {nodes.map((node) => (
        <Link
          key={node.id}
          to={`/learning-units/${node.learningUnitId}`}
          style={{ left: node.left, top: node.top }}
          className="group absolute z-30 -translate-x-1/2 -translate-y-1/2"
          aria-label={`Odpri učno enoto ${node.title}`}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#F8E7BE] bg-[#344E41] text-xl font-bold text-white shadow-xl transition duration-200 group-hover:scale-110 group-hover:bg-[#5F6F52] group-focus-visible:outline group-focus-visible:outline-4 group-focus-visible:outline-offset-4 group-focus-visible:outline-[#F8E7BE]">
            {node.order}
          </span>

          <span className="pointer-events-none absolute bottom-full left-1/2 mb-4 w-72 -translate-x-1/2 rounded-2xl border border-[#E1D4BF] bg-white/95 p-4 text-left opacity-0 shadow-xl backdrop-blur transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="block text-sm font-bold text-[#283618]">
              {node.title}
            </span>

            <span className="mt-1 line-clamp-3 block text-xs leading-5 text-[#5F6652]">
              {node.description}
            </span>

            <span className="mt-3 block text-xs font-semibold text-[#6F7F58]">
              Odpri učno enoto →
            </span>
          </span>
        </Link>
      ))}

      <div className="absolute bottom-6 right-20 z-20 rounded-3xl bg-white/90 px-6 py-5 text-right shadow-md backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F7F58]">
          Zaključek poti
        </p>
        <p className="mt-2 text-xl font-bold text-[#283618]">Cilj dosežen</p>
      </div>
    </section>
  )
}