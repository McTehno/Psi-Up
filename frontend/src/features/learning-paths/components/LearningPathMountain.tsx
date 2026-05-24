import { Link } from 'react-router-dom'

import mountainJourneyBg from '../../../assets/mountain-journey-bg.png'

export type LearningPathMountainNode = {
  id: string
  order: number
  title: string
  description: string
  learningUnitId: string
}

type PositionedMountainNode = LearningPathMountainNode & {
  x: number
  y: number
}

type LearningPathMountainProps = {
  title: string
  description: string
  targetLabel?: string
  nodes: LearningPathMountainNode[]
  className?: string
}

const MAX_VISIBLE_NODES = 7

const nodePositionPresets: Record<number, Array<{ x: number; y: number }>> = {
  1: [{ x: 50, y: 48 }],
  2: [
    { x: 28, y: 68 },
    { x: 68, y: 30 },
  ],
  3: [
    { x: 22, y: 72 },
    { x: 48, y: 50 },
    { x: 74, y: 11 },
  ],
  4: [
    { x: 18, y: 74 },
    { x: 38, y: 58 },
    { x: 58, y: 39 },
    { x: 74, y: 11 },
  ],
  5: [
    { x: 18, y: 74 },
    { x: 34, y: 62 },
    { x: 50, y: 47 },
    { x: 65, y: 33 },
    { x: 74, y: 11 },
  ],
  6: [
    { x: 16, y: 75 },
    { x: 29, y: 66 },
    { x: 42, y: 56 },
    { x: 55, y: 43 },
    { x: 68, y: 30 },
    { x: 74, y: 11 },
  ],
  7: [
    { x: 15, y: 76 },
    { x: 26, y: 68 },
    { x: 38, y: 59 },
    { x: 50, y: 49 },
    { x: 61, y: 38 },
    { x: 68, y: 25 },
    { x: 74, y: 11 },
  ],
}

function getPositionedNodes(
  nodes: LearningPathMountainNode[],
): PositionedMountainNode[] {
  const visibleNodes = nodes
    .slice()
    .sort((a, b) => a.order - b.order)
    .slice(0, MAX_VISIBLE_NODES)

  const positions =
    nodePositionPresets[visibleNodes.length] ?? nodePositionPresets[1]

  return visibleNodes.map((node, index) => ({
    ...node,
    x: positions[index].x,
    y: positions[index].y,
  }))
}

function createPathD(nodes: PositionedMountainNode[]) {
  return nodes
    .map((node, index) => `${index === 0 ? 'M' : 'L'} ${node.x} ${node.y}`)
    .join(' ')
}

export function LearningPathMountain({
  title,
  description,
  targetLabel,
  nodes,
  className = '',
}: LearningPathMountainProps) {
  const positionedNodes = getPositionedNodes(nodes)
  const pathD = createPathD(positionedNodes)
  const hiddenNodeCount = Math.max(nodes.length - MAX_VISIBLE_NODES, 0)

  return (
    <section
      className={`relative h-full min-h-[620px] overflow-hidden rounded-[2rem] border border-[#DED2BC] bg-[#EFE2CC] shadow-sm ${className}`}
    >
      <img
        src={mountainJourneyBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-[#344E41]/20" />

      {positionedNodes.length > 1 && (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={pathD}
            fill="none"
            stroke="#F8E7BE"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      <div className="absolute left-4 right-4 top-4 z-20 rounded-3xl bg-white/88 p-5 shadow-md backdrop-blur sm:left-6 sm:right-auto sm:top-6 sm:max-w-xl sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6F7F58]">
          Učna pot
        </p>

        <h1 className="mt-2 text-2xl font-bold leading-tight text-[#283618] sm:text-3xl xl:text-4xl">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#5F6652] xl:text-base">
          {description}
        </p>

        {targetLabel && (
          <div className="mt-4 inline-flex rounded-full bg-[#F7F1E6] px-4 py-2 text-xs font-semibold text-[#344E41] sm:text-sm">
            Fokus: {targetLabel}
          </div>
        )}
      </div>

      {hiddenNodeCount > 0 && (
        <div className="absolute right-6 top-6 z-20 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#344E41] shadow-sm backdrop-blur">
          +{hiddenNodeCount} dodatnih enot
        </div>
      )}

      {positionedNodes.map((node) => (
        <Link
          key={node.id}
          to={`/learning-units/${node.learningUnitId}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          className="group absolute z-30 -translate-x-1/2 -translate-y-1/2"
          aria-label={`Odpri učno enoto ${node.title}`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#F8E7BE] bg-[#344E41] text-base font-bold text-white shadow-xl transition duration-200 group-hover:scale-110 group-hover:bg-[#5F6F52] group-focus-visible:outline group-focus-visible:outline-4 group-focus-visible:outline-offset-4 group-focus-visible:outline-[#F8E7BE] sm:h-14 sm:w-14 sm:text-lg xl:h-16 xl:w-16 xl:text-xl">
            {node.order}
          </span>

          <span className="pointer-events-none absolute bottom-full left-1/2 mb-4 w-64 -translate-x-1/2 rounded-2xl border border-[#E1D4BF] bg-white/95 p-4 text-left opacity-0 shadow-xl backdrop-blur transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:w-72">
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

      <div className="absolute bottom-5 right-5 z-20 rounded-3xl bg-white/90 px-5 py-4 text-right shadow-md backdrop-blur sm:bottom-6 sm:right-20 sm:px-6 sm:py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F7F58]">
          Zaključek poti
        </p>
        <p className="mt-1 text-lg font-bold text-[#283618] sm:text-xl">
          Cilj dosežen
        </p>
      </div>
    </section>
  )
}