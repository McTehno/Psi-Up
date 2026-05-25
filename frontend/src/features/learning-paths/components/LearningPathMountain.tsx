import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, Clock, Flag } from 'lucide-react'

import mountainJourneyBg from '../../../assets/mountain-journey-bg.png'
import mountainJourneyBgMobile from '../../../assets/mountain-journey-bg_mobile.png'

export type LearningPathMountainNode = {
  id: string
  order: number
  title: string
  description: string
  moduleId: string
  durationHours?: number | null
  isRequired?: boolean
  parallelGroup?: string | null
}

type PositionedMountainNode = LearningPathMountainNode & {
  x: number
  y: number
  displayLabel: string
  parallelIndex: number
  parallelCount: number
}

type LearningPathMountainProps = {
  title: string
  description: string
  targetLabel?: string
  nodes: LearningPathMountainNode[]
  isCompleted?: boolean
  className?: string
}

type Position = {
  x: number
  y: number
}

type PathPoint = {
  id: string
  x: number
  y: number
}

type PathSegment = {
  from: PathPoint
  to: PathPoint
}

type LayoutVariant = 'mobile' | 'tablet' | 'desktop'

const MAX_VISIBLE_NODES = 7
const PARALLEL_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const desktopLevelPositionPresets: Record<number, Position[]> = {
  1: [{ x: 50, y: 58 }],
  2: [
    { x: 32, y: 68 },
    { x: 66, y: 38 },
  ],
  3: [
    { x: 24, y: 72 },
    { x: 48, y: 56 },
    { x: 68, y: 36 },
  ],
  4: [
    { x: 20, y: 74 },
    { x: 40, y: 60 },
    { x: 58, y: 45 },
    { x: 70, y: 29 },
  ],
  5: [
    { x: 18, y: 74 },
    { x: 34, y: 62 },
    { x: 50, y: 48 },
    { x: 64, y: 34 },
    { x: 72, y: 18 },
  ],
  6: [
    { x: 16, y: 75 },
    { x: 29, y: 66 },
    { x: 42, y: 56 },
    { x: 55, y: 43 },
    { x: 68, y: 30 },
    { x: 74, y: 14 },
  ],
  7: [
    { x: 15, y: 76 },
    { x: 26, y: 68 },
    { x: 38, y: 59 },
    { x: 50, y: 49 },
    { x: 61, y: 38 },
    { x: 68, y: 25 },
    { x: 74, y: 14 },
  ],
}

const tabletLevelPositionPresets: Record<number, Position[]> = {
  1: [{ x: 50, y: 62 }],
  2: [
    { x: 31, y: 72 },
    { x: 65, y: 45 },
  ],
  3: [
    { x: 25, y: 75 },
    { x: 48, y: 61 },
    { x: 67, y: 43 },
  ],
  4: [
    { x: 22, y: 77 },
    { x: 41, y: 66 },
    { x: 57, y: 54 },
    { x: 69, y: 39 },
  ],
  5: [
    { x: 20, y: 78 },
    { x: 36, y: 69 },
    { x: 50, y: 58 },
    { x: 63, y: 47 },
    { x: 71, y: 32 },
  ],
  6: [
    { x: 18, y: 79 },
    { x: 31, y: 72 },
    { x: 43, y: 64 },
    { x: 55, y: 54 },
    { x: 66, y: 43 },
    { x: 73, y: 29 },
  ],
  7: [
    { x: 17, y: 80 },
    { x: 28, y: 74 },
    { x: 39, y: 67 },
    { x: 50, y: 59 },
    { x: 60, y: 50 },
    { x: 68, y: 40 },
    { x: 74, y: 28 },
  ],
}

const mobileLevelPositionPresets: Record<number, Position[]> = {
  1: [{ x: 50, y: 64 }],
  2: [
    { x: 36, y: 78 },
    { x: 58, y: 56 },
  ],
  3: [
    { x: 31, y: 80 },
    { x: 47, y: 67 },
    { x: 58, y: 55 },
  ],
  4: [
    { x: 28, y: 82 },
    { x: 42, y: 72 },
    { x: 53, y: 62 },
    { x: 58, y: 52 },
  ],
  5: [
    { x: 25, y: 84 },
    { x: 38, y: 76 },
    { x: 49, y: 68 },
    { x: 56, y: 60 },
    { x: 58, y: 52 },
  ],
  6: [
    { x: 23, y: 84 },
    { x: 35, y: 78 },
    { x: 46, y: 72 },
    { x: 53, y: 66 },
    { x: 58, y: 59 },
    { x: 57, y: 52 },
  ],
  7: [
    { x: 22, y: 85 },
    { x: 32, y: 80 },
    { x: 43, y: 75 },
    { x: 51, y: 69 },
    { x: 56, y: 63 },
    { x: 59, y: 57 },
    { x: 57, y: 51 },
  ],
}

const desktopParallelOffsets: Record<number, Position[]> = {
  1: [{ x: 0, y: 0 }],
  2: [
    { x: -7, y: 2 },
    { x: 7, y: -2 },
  ],
  3: [
    { x: -10, y: 3 },
    { x: 0, y: -2 },
    { x: 10, y: 3 },
  ],
  4: [
    { x: -13, y: 4 },
    { x: -4, y: -2 },
    { x: 4, y: -2 },
    { x: 13, y: 4 },
  ],
}

const tabletParallelOffsets: Record<number, Position[]> = {
  1: [{ x: 0, y: 0 }],
  2: [
    { x: -8, y: 2 },
    { x: 8, y: -2 },
  ],
  3: [
    { x: -11, y: 3 },
    { x: 0, y: -2 },
    { x: 11, y: 3 },
  ],
  4: [
    { x: -14, y: 4 },
    { x: -5, y: -2 },
    { x: 5, y: -2 },
    { x: 14, y: 4 },
  ],
}

const mobileParallelOffsets: Record<number, Position[]> = {
  1: [{ x: 0, y: 0 }],
  2: [
    { x: -9, y: 2 },
    { x: 9, y: -2 },
  ],
  3: [
    { x: -12, y: 3 },
    { x: 0, y: -2 },
    { x: 12, y: 3 },
  ],
  4: [
    { x: -14, y: 4 },
    { x: -5, y: -2 },
    { x: 5, y: -2 },
    { x: 14, y: 4 },
  ],
}

const desktopFinishFlagPosition: Position = {
  x: 74,
  y: 9,
}

const tabletFinishFlagPosition: Position = {
  x: 78,
  y: 18,
}

const mobileFinishFlagPosition: Position = {
  x: 55,
  y: 44,
}

function formatDuration(durationHours?: number | null) {
  if (durationHours == null) {
    return 'Trajanje ni navedeno'
  }

  if (durationHours === 1) {
    return '1 ura'
  }

  if (durationHours === 2) {
    return '2 uri'
  }

  if (durationHours === 3 || durationHours === 4) {
    return `${durationHours} ure`
  }

  return `${durationHours} ur`
}

function getSortedVisibleNodes(nodes: LearningPathMountainNode[]) {
  return nodes
    .slice()
    .sort((firstNode, secondNode) => {
      if (firstNode.order !== secondNode.order) {
        return firstNode.order - secondNode.order
      }

      return firstNode.title.localeCompare(secondNode.title, 'sl')
    })
    .slice(0, MAX_VISIBLE_NODES)
}

function groupNodesByOrder(nodes: LearningPathMountainNode[]) {
  const groups = new Map<number, LearningPathMountainNode[]>()

  nodes.forEach((node) => {
    const existingGroup = groups.get(node.order) ?? []
    existingGroup.push(node)
    groups.set(node.order, existingGroup)
  })

  return Array.from(groups.entries())
    .sort(([firstOrder], [secondOrder]) => firstOrder - secondOrder)
    .map(([, groupedNodes]) =>
      groupedNodes.slice().sort((firstNode, secondNode) => {
        const firstParallelGroup = firstNode.parallelGroup ?? ''
        const secondParallelGroup = secondNode.parallelGroup ?? ''

        if (firstParallelGroup !== secondParallelGroup) {
          return firstParallelGroup.localeCompare(secondParallelGroup, 'sl')
        }

        return firstNode.title.localeCompare(secondNode.title, 'sl')
      }),
    )
}

function getFallbackLevelPositions(levelCount: number): Position[] {
  if (levelCount <= 1) {
    return [{ x: 50, y: 58 }]
  }

  return Array.from({ length: levelCount }, (_, index) => {
    const progress = index / (levelCount - 1)

    return {
      x: 18 + progress * 56,
      y: 76 - progress * 60,
    }
  })
}

function getBranchOffsets(
  parallelCount: number,
  variant: LayoutVariant,
): Position[] {
  const offsetsByVariant = {
    mobile: mobileParallelOffsets,
    tablet: tabletParallelOffsets,
    desktop: desktopParallelOffsets,
  }

  const presetOffsets = offsetsByVariant[variant][parallelCount]

  if (presetOffsets) {
    return presetOffsets
  }

  const spacing = variant === 'mobile' ? 8 : variant === 'tablet' ? 7 : 6
  const middle = (parallelCount - 1) / 2

  return Array.from({ length: parallelCount }, (_, index) => ({
    x: (index - middle) * spacing,
    y: index % 2 === 0 ? 2 : -2,
  }))
}

function getPositionedNodeLevels(
  nodes: LearningPathMountainNode[],
  levelPositionPresets: Record<number, Position[]>,
  variant: LayoutVariant,
): PositionedMountainNode[][] {
  const visibleNodes = getSortedVisibleNodes(nodes)
  const groupedNodes = groupNodesByOrder(visibleNodes)
  const levelPositions =
    levelPositionPresets[groupedNodes.length] ??
    getFallbackLevelPositions(groupedNodes.length)

  return groupedNodes.map((levelNodes, levelIndex) => {
    const levelPosition = levelPositions[levelIndex]
    const branchOffsets = getBranchOffsets(levelNodes.length, variant)

    return levelNodes.map((node, parallelIndex) => {
      const branchOffset = branchOffsets[parallelIndex]
      const parallelCount = levelNodes.length
      const displayLabel =
        parallelCount > 1
          ? `${node.order}${PARALLEL_LABELS[parallelIndex] ?? parallelIndex + 1}`
          : String(node.order)

      return {
        ...node,
        x: Math.min(Math.max(levelPosition.x + branchOffset.x, 10), 90),
        y: Math.min(Math.max(levelPosition.y + branchOffset.y, 16), 88),
        displayLabel,
        parallelIndex,
        parallelCount,
      }
    })
  })
}

function flattenNodeLevels(levels: PositionedMountainNode[][]) {
  return levels.flat()
}

function createPathSegments(levels: PositionedMountainNode[][]): PathSegment[] {
  const segments: PathSegment[] = []

  for (let levelIndex = 0; levelIndex < levels.length - 1; levelIndex += 1) {
    const currentLevel = levels[levelIndex]
    const nextLevel = levels[levelIndex + 1]

    if (currentLevel.length === 1 || nextLevel.length === 1) {
      currentLevel.forEach((fromNode) => {
        nextLevel.forEach((toNode) => {
          segments.push({ from: fromNode, to: toNode })
        })
      })

      continue
    }

    currentLevel.forEach((fromNode, index) => {
      const matchingNode = nextLevel[index] ?? nextLevel[nextLevel.length - 1]
      segments.push({ from: fromNode, to: matchingNode })
    })
  }

  return segments
}

function createFinishPathSegments(
  levels: PositionedMountainNode[][],
  finishPosition: Position,
): PathSegment[] {
  const lastLevel = levels[levels.length - 1] ?? []

  return lastLevel.map((node) => ({
    from: node,
    to: {
      id: 'finish-flag',
      x: finishPosition.x,
      y: finishPosition.y,
    },
  }))
}

function FinishFlag({
  position,
  isCompleted,
  className = '',
}: {
  position: Position
  isCompleted: boolean
  className?: string
}) {
  return (
    <div
      className={`absolute z-30 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-lg backdrop-blur transition min-[1500px]:h-16 min-[1500px]:w-16 ${
        isCompleted
          ? 'border-[#F8E7BE] bg-[#344E41] text-white'
          : 'border-[#DED2BC] bg-white/90 text-[#8A8F83]'
      } ${className}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      title={isCompleted ? 'Učna pot zaključena' : 'Cilj učne poti'}
      aria-label={isCompleted ? 'Učna pot zaključena' : 'Cilj učne poti'}
    >
      <Flag
        className="h-6 w-6 min-[1500px]:h-7 min-[1500px]:w-7"
        strokeWidth={2.4}
      />
    </div>
  )
}

function ModuleDetailBox({
  node,
  onClose,
  className = '',
  style,
}: {
  node: PositionedMountainNode
  onClose: () => void
  className?: string
  style?: CSSProperties
}) {
  return (
    <article
      role="dialog"
      aria-label={`Podrobnosti modula ${node.title}`}
      className={`rounded-[1.75rem] border border-[#DED2BC] bg-white/95 p-5 text-[#283618] shadow-2xl backdrop-blur md:p-6 ${className}`}
      style={style}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6F7F58]">
            Modul {node.displayLabel}
          </p>

          <h2 className="mt-2 text-2xl font-bold leading-tight text-[#283618]">
            {node.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DED2BC] bg-[#F7F1E6] text-[#344E41] transition hover:bg-[#EFE2CC]"
          aria-label="Zapri podrobnosti modula"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <p className="text-sm leading-6 text-[#5F6652]">
        {node.description || 'Opis modula še ni dodan.'}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#F7F1E6] px-3 py-2 text-xs font-semibold text-[#344E41]">
          <Clock className="h-4 w-4" />
          {formatDuration(node.durationHours)}
        </span>

        {node.parallelCount > 1 && (
          <span className="rounded-full bg-[#F4EEE4] px-3 py-2 text-xs font-semibold text-[#5F6652]">
            Vzporedni modul
          </span>
        )}

        {node.isRequired && (
          <span className="rounded-full bg-[#E8EFE5] px-3 py-2 text-xs font-semibold text-[#344E41]">
            Obvezen modul
          </span>
        )}

        {node.parallelGroup && (
          <span className="rounded-full bg-[#F4EEE4] px-3 py-2 text-xs font-semibold text-[#5F6652]">
            Skupina {node.parallelGroup}
          </span>
        )}
      </div>

      <Link
        to={`/modules/${node.moduleId}`}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#344E41] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2B4036]"
      >
        Podrobnosti modula
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  )
}

export function LearningPathMountain({
  title,
  description,
  targetLabel,
  nodes,
  isCompleted = false,
  className = '',
}: LearningPathMountainProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

    const desktopNodeLevels = useMemo(
    () => getPositionedNodeLevels(nodes, desktopLevelPositionPresets, 'desktop'),
    [nodes],
  )

  const tabletNodeLevels = useMemo(
    () => getPositionedNodeLevels(nodes, tabletLevelPositionPresets, 'tablet'),
    [nodes],
  )

  const mobileNodeLevels = useMemo(
    () => getPositionedNodeLevels(nodes, mobileLevelPositionPresets, 'mobile'),
    [nodes],
  )

  const desktopPositionedNodes = useMemo(
    () => flattenNodeLevels(desktopNodeLevels),
    [desktopNodeLevels],
  )

  const tabletPositionedNodes = useMemo(
    () => flattenNodeLevels(tabletNodeLevels),
    [tabletNodeLevels],
  )

  const mobilePositionedNodes = useMemo(
    () => flattenNodeLevels(mobileNodeLevels),
    [mobileNodeLevels],
  )

  const selectedDesktopNode = useMemo(
    () =>
      desktopPositionedNodes.find((node) => node.id === selectedNodeId) ?? null,
    [desktopPositionedNodes, selectedNodeId],
  )

  const selectedTabletNode = useMemo(
    () =>
      tabletPositionedNodes.find((node) => node.id === selectedNodeId) ?? null,
    [tabletPositionedNodes, selectedNodeId],
  )

  const selectedMobileNode = useMemo(
    () =>
      mobilePositionedNodes.find((node) => node.id === selectedNodeId) ?? null,
    [mobilePositionedNodes, selectedNodeId],
  )

  const desktopPathSegments = useMemo(
    () => createPathSegments(desktopNodeLevels),
    [desktopNodeLevels],
  )

  const tabletPathSegments = useMemo(
    () => createPathSegments(tabletNodeLevels),
    [tabletNodeLevels],
  )

  const mobilePathSegments = useMemo(
    () => createPathSegments(mobileNodeLevels),
    [mobileNodeLevels],
  )

  const desktopFinishPathSegments = useMemo(
    () =>
      createFinishPathSegments(desktopNodeLevels, desktopFinishFlagPosition),
    [desktopNodeLevels],
  )

  const tabletFinishPathSegments = useMemo(
    () => createFinishPathSegments(tabletNodeLevels, tabletFinishFlagPosition),
    [tabletNodeLevels],
  )

  const mobileFinishPathSegments = useMemo(
    () => createFinishPathSegments(mobileNodeLevels, mobileFinishFlagPosition),
    [mobileNodeLevels],
  )

  const desktopAllPathSegments = useMemo(
    () => [...desktopPathSegments, ...desktopFinishPathSegments],
    [desktopPathSegments, desktopFinishPathSegments],
  )

  const tabletAllPathSegments = useMemo(
    () => [...tabletPathSegments, ...tabletFinishPathSegments],
    [tabletPathSegments, tabletFinishPathSegments],
  )

  const mobileAllPathSegments = useMemo(
    () => [...mobilePathSegments, ...mobileFinishPathSegments],
    [mobilePathSegments, mobileFinishPathSegments],
  )

  const hiddenNodeCount = Math.max(nodes.length - MAX_VISIBLE_NODES, 0)

  function renderPathSegments(segments: PathSegment[], className: string) {
    if (segments.length === 0) {
      return null
    }

    return (
      <svg
        className={`pointer-events-none absolute inset-0 z-10 h-full w-full ${className}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {segments.map((segment) => (
          <path
            key={`${segment.from.id}-${segment.to.id}`}
            d={`M ${segment.from.x} ${segment.from.y} L ${segment.to.x} ${segment.to.y}`}
            fill="none"
            stroke="#344E41"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 4"
            strokeOpacity="0.72"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    )
  }

  function renderNodes(
    nodesToRender: PositionedMountainNode[],
    className: string,
  ) {
    return nodesToRender.map((node) => {
      const isSelected = selectedNodeId === node.id
      const hasParallelLabel = node.parallelCount > 1

      return (
        <button
          key={node.id}
          type="button"
          onClick={() => setSelectedNodeId(node.id)}
          className={`absolute z-30 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#F8E7BE] bg-[#344E41] font-bold text-white shadow-lg transition duration-200 hover:scale-105 hover:bg-[#5F6F52] focus:outline-none focus:ring-4 focus:ring-[#F8E7BE]/70 min-[1500px]:h-14 min-[1500px]:w-14 ${
            hasParallelLabel ? 'text-[0.78rem] min-[1500px]:text-sm' : 'text-base min-[1500px]:text-lg'
          } ${className} ${
            isSelected ? 'scale-110 bg-[#5F6F52] ring-4 ring-[#F8E7BE]/70' : ''
          }`}
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
          }}
          aria-pressed={isSelected}
          aria-label={`Odpri podrobnosti modula ${node.title}`}
        >
          {node.displayLabel}
        </button>
      )
    })
  }

  return (
    <section
      className={`relative h-full min-h-[680px] overflow-hidden rounded-[2rem] border border-[#DED2BC] bg-[#EFE2CC] shadow-sm max-[639px]:min-h-[720px] ${className}`}
    >
      <picture>
        <source media="(max-width: 999px)" srcSet={mountainJourneyBgMobile} />
        <img
          src={mountainJourneyBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top min-[1500px]:object-center"
        />
      </picture>

      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-[#344E41]/20" />

      {renderPathSegments(
        desktopAllPathSegments,
        'hidden min-[1500px]:block',
      )}

      {renderPathSegments(
        tabletAllPathSegments,
        'hidden min-[1000px]:block min-[1500px]:hidden',
      )}

      {renderPathSegments(
        mobileAllPathSegments,
        'min-[1000px]:hidden',
      )}

      <FinishFlag
        position={desktopFinishFlagPosition}
        isCompleted={isCompleted}
        className="hidden min-[1500px]:flex"
      />

      <FinishFlag
        position={tabletFinishFlagPosition}
        isCompleted={isCompleted}
        className="hidden min-[1000px]:flex min-[1500px]:hidden"
      />

      <FinishFlag
        position={mobileFinishFlagPosition}
        isCompleted={isCompleted}
        className="flex min-[1000px]:hidden"
      />

      <div className="absolute left-3 right-3 top-3 z-40 rounded-[1.6rem] bg-white/90 p-4 shadow-md backdrop-blur sm:left-6 sm:right-auto sm:top-6 sm:max-w-xl sm:p-6 min-[1500px]:left-8 min-[1500px]:top-8 min-[1500px]:max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6F7F58]">
          Učna pot
        </p>

        <h1 className="mt-2 text-[1.55rem] font-bold leading-[1.15] text-[#283618] sm:text-3xl min-[1500px]:text-4xl">
          {title}
        </h1>

        <p className="mt-3 max-h-24 overflow-hidden text-[0.95rem] leading-6 text-[#5F6652] sm:max-h-none sm:text-base">
          {description}
        </p>

        {targetLabel && (
          <div className="mt-4 inline-flex max-w-full rounded-full bg-[#F7F1E6] px-4 py-2 text-xs font-semibold text-[#344E41] sm:text-sm">
            <span className="max-h-10 overflow-hidden">
              Fokus: {targetLabel}
            </span>
          </div>
        )}
      </div>

      {hiddenNodeCount > 0 && (
        <div className="absolute right-4 top-4 z-20 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#344E41] shadow-sm backdrop-blur sm:right-6 sm:top-6">
          +{hiddenNodeCount} dodatnih modulov
        </div>
      )}

      <div className="absolute right-20 top-20 z-20 hidden rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#344E41] shadow-sm backdrop-blur min-[1500px]:block">
        Klikni modul
      </div>

      {renderNodes(desktopPositionedNodes, 'hidden min-[1500px]:flex')}

      {renderNodes(
        tabletPositionedNodes,
        'hidden min-[1000px]:flex min-[1500px]:hidden',
      )}

      {renderNodes(mobilePositionedNodes, 'flex min-[1000px]:hidden')}

      {selectedDesktopNode && (
        <ModuleDetailBox
          node={selectedDesktopNode}
          onClose={() => setSelectedNodeId(null)}
          className="absolute z-50 hidden w-[390px] min-[1500px]:block"
          style={{
            left: `${Math.min(Math.max(selectedDesktopNode.x, 24), 76)}%`,
            top:
              selectedDesktopNode.y > 44
                ? `calc(${selectedDesktopNode.y}% - 1rem)`
                : `calc(${selectedDesktopNode.y}% + 4rem)`,
            transform:
              selectedDesktopNode.y > 44
                ? 'translate(-50%, -100%)'
                : 'translate(-50%, 0)',
          }}
        />
      )}

      {selectedTabletNode && (
        <ModuleDetailBox
          node={selectedTabletNode}
          onClose={() => setSelectedNodeId(null)}
          className="absolute z-50 hidden w-[350px] min-[1000px]:block min-[1500px]:hidden"
          style={{
            left: `${Math.min(Math.max(selectedTabletNode.x, 22), 78)}%`,
            top:
              selectedTabletNode.y > 50
                ? `calc(${selectedTabletNode.y}% - 1rem)`
                : `calc(${selectedTabletNode.y}% + 4rem)`,
            transform:
              selectedTabletNode.y > 50
                ? 'translate(-50%, -100%)'
                : 'translate(-50%, 0)',
          }}
        />
      )}

      {selectedMobileNode && (
        <div className="fixed inset-x-3 bottom-3 z-50 min-[1000px]:hidden">
          <ModuleDetailBox
            node={selectedMobileNode}
            onClose={() => setSelectedNodeId(null)}
            className="max-h-[72vh] overflow-y-auto"
          />
        </div>
      )}

      <div className="absolute bottom-5 right-25 z-20 hidden rounded-3xl bg-white/88 px-6 py-4 text-center shadow-md backdrop-blur sm:block">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F7F58]">
          Zaključek poti
        </p>

        <p className="mt-1 text-lg font-bold text-[#283618]">
          {isCompleted ? 'Cilj dosežen' : 'Cilj poti'}
        </p>
      </div>
    </section>
  )
}