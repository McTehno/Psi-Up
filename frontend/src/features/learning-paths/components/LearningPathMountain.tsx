import { useEffect, useMemo, useState, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Flag,
  Heart,
  Layers3,
} from 'lucide-react'

import mountainJourneyBg from '../../../assets/mountain-journey-bg.png'
import mountainJourneyBgMobile from '../../../assets/mountain-journey-bg_mobile.png'
import type { AssessmentStatus } from '../../../types/assessment'

export type LearningPathMountainNode = {
  id: string
  order: number
  title: string
  description: string
  moduleId: string
  durationHours?: number | null
  isRequired?: boolean
  parallelGroup?: string | null
  assessmentStatus?: AssessmentStatus | null
}

type PositionedMountainNode = LearningPathMountainNode & {
  x: number
  y: number
  displayLabel: string
  parallelIndex: number
  parallelCount: number
}

type LearningPathMountainProps = {
  nodes: LearningPathMountainNode[]
  durationLabel: string
  moduleCount: number
  learningUnitCount: number
  isCompleted?: boolean
  celebrateCompletedOnMount?: boolean
  onFavoriteClick?: () => void
  onSaveClick?: () => void
  onCompletedChange?: (isCompleted: boolean) => void
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
  isParallelTransition?: boolean
}

type LayoutVariant = 'mobile' | 'tablet' | 'desktop'

type MountainAction = 'favorite' | 'save' | 'completed' | null

const MAX_VISIBLE_NODES = 7
const PARALLEL_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const flagConfettiParticles = [
  { x: -34, y: -30, delay: 0, rotate: -28, size: 7, color: '#d08a34' },
  { x: -18, y: -42, delay: 35, rotate: 18, size: 6, color: '#31583b' },
  { x: 4, y: -48, delay: 70, rotate: 44, size: 7, color: '#f2c879' },
  { x: 28, y: -38, delay: 45, rotate: -52, size: 6, color: '#6f7f58' },
  { x: 40, y: -16, delay: 95, rotate: 26, size: 7, color: '#d08a34' },
  { x: 34, y: 12, delay: 120, rotate: 68, size: 5, color: '#31583b' },
  { x: 12, y: 34, delay: 80, rotate: -18, size: 6, color: '#f2c879' },
  { x: -18, y: 32, delay: 110, rotate: 35, size: 5, color: '#6f7f58' },
  { x: -38, y: 12, delay: 65, rotate: -64, size: 6, color: '#d08a34' },
  { x: -42, y: -10, delay: 20, rotate: 48, size: 5, color: '#31583b' },
]

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

const desktopFinishFlagPosition: Position = { x: 74, y: 9 }
const tabletFinishFlagPosition: Position = { x: 78, y: 18 }
const mobileFinishFlagPosition: Position = { x: 55, y: 44 }

function getNodeAssessmentClassName(status?: AssessmentStatus | null) {
  if (!status || status === 'completed') {
    return 'border-[#F8E7BE] bg-[#344E41] text-white hover:bg-[#5F6F52] focus-visible:ring-[#F8E7BE]/70'
  }

  if (status === 'partially_completed') {
    return 'border-[#d8a24d] bg-[#F8E7BE] text-[#344E41] hover:bg-[#f3ddb0] focus-visible:ring-[#d8a24d]/40'
  }

  return 'border-[#DED2BC] bg-white/90 text-[#344E41] hover:bg-[#F7F1E6] focus-visible:ring-[#DED2BC]/70'
}

function formatModuleDuration(durationHours?: number | null) {
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
  const offsetsByVariant: Record<LayoutVariant, Record<number, Position[]>> = {
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
    const isParallelTransition = currentLevel.length > 1 || nextLevel.length > 1

    if (currentLevel.length === 1 || nextLevel.length === 1) {
      currentLevel.forEach((fromNode) => {
        nextLevel.forEach((toNode) => {
          segments.push({
            from: fromNode,
            to: toNode,
            isParallelTransition,
          })
        })
      })

      continue
    }

    currentLevel.forEach((fromNode, index) => {
      const matchingNode = nextLevel[index] ?? nextLevel[nextLevel.length - 1]

      segments.push({
        from: fromNode,
        to: matchingNode,
        isParallelTransition,
      })
    })
  }

  return segments
}

function createFinishPathSegments(
  levels: PositionedMountainNode[][],
  finishPosition: Position,
): PathSegment[] {
  const lastLevel = levels[levels.length - 1] ?? []
  const isParallelTransition = lastLevel.length > 1

  return lastLevel.map((node) => ({
    from: node,
    to: {
      id: 'finish-flag',
      x: finishPosition.x,
      y: finishPosition.y,
    },
    isParallelTransition,
  }))
}

function FinishFlag({
  position,
  isCompleted,
  celebrationKey = 0,
  className = '',
}: {
  position: Position
  isCompleted: boolean
  celebrationKey?: number
  className?: string
}) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!isCompleted || celebrationKey === 0) {
      return
    }

    setShowConfetti(false)

    const animationFrame = window.requestAnimationFrame(() => {
      setShowConfetti(true)
    })

    const timeout = window.setTimeout(() => {
      setShowConfetti(false)
    }, 950)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(timeout)
    }
  }, [celebrationKey, isCompleted])

  return (
    <div
      className={[
        'absolute z-30 -translate-x-1/2 -translate-y-1/2',
        className,
      ].join(' ')}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      aria-label="Zaključek poti"
    >
      <div
        className={[
          'relative flex h-14 w-14 items-center justify-center rounded-full border shadow-md backdrop-blur transition-colors duration-700 ease-out',
          isCompleted
            ? 'border-[#31583b] bg-[#31583b] text-white shadow-[0_18px_36px_rgba(49,88,59,0.22)]'
            : 'border-[#DED2BC] bg-white/85 text-[#6F7F58]',
          showConfetti ? 'learning-path-flag-pop' : '',
        ].join(' ')}
      >
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 z-[-1]">
            <span className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#31583b]/25 opacity-0 learning-path-flag-ring" />

            {flagConfettiParticles.map((particle, index) => (
              <span
                key={`${particle.x}-${particle.y}-${index}`}
                className="absolute left-1/2 top-1/2 rounded-[3px] learning-path-confetti-piece"
                style={
                  {
                    '--confetti-x': `${particle.x}px`,
                    '--confetti-y': `${particle.y}px`,
                    '--confetti-r': `${particle.rotate}deg`,
                    animationDelay: `${particle.delay}ms`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}

        <Flag className="h-7 w-7" />
      </div>
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
      className={[
        'rounded-[1.5rem] border border-[#DED2BC] bg-white/95 p-5 shadow-xl backdrop-blur',
        className,
      ].join(' ')}
      style={style}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6F7F58]">
            Modul {node.displayLabel}
          </p>

          <h3 className="mt-2 font-serif text-2xl leading-tight text-[#283618]">
            {node.title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#eadfce] bg-white text-[#283618] transition hover:bg-[#F7F1E6]"
          aria-label="Zapri podrobnosti modula"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <p className="text-sm leading-6 text-[#6b6258]">
        {node.description || 'Opis modula še ni dodan.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#F7F1E6] px-3 py-1.5 text-xs font-bold text-[#344E41]">
          {formatModuleDuration(node.durationHours)}
        </span>

        {node.parallelCount > 1 && (
          <span className="rounded-full bg-[#F7F1E6] px-3 py-1.5 text-xs font-bold text-[#344E41]">
            Vzporedni modul
          </span>
        )}

        {node.isRequired && (
          <span className="rounded-full bg-[#F7F1E6] px-3 py-1.5 text-xs font-bold text-[#344E41]">
            Obvezen modul
          </span>
        )}

        {node.parallelGroup && (
          <span className="rounded-full bg-[#F7F1E6] px-3 py-1.5 text-xs font-bold text-[#344E41]">
            Skupina {node.parallelGroup}
          </span>
        )}
      </div>

      <Link
        to={`/modules/${node.moduleId}`}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#344E41] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#283618]"
      >
        Podrobnosti modula
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  )
}

function MountainActions({
  isCompleted,
  onFavoriteClick,
  onSaveClick,
  onCompletedChange,
}: {
  isCompleted: boolean
  onFavoriteClick?: () => void
  onSaveClick?: () => void
  onCompletedChange?: (isCompleted: boolean) => void
}) {
  const [activeAction, setActiveAction] = useState<MountainAction>(null)
  const [localIsCompleted, setLocalIsCompleted] = useState(isCompleted)

  useEffect(() => {
    setLocalIsCompleted(isCompleted)
  }, [isCompleted])

  function handleAction(action: Exclude<MountainAction, null>) {
    setActiveAction(action)

    if (action === 'favorite') {
      onFavoriteClick?.()
    }

    if (action === 'save') {
      onSaveClick?.()
    }

    if (action === 'completed') {
      setLocalIsCompleted((currentValue) => {
        const nextValue = !currentValue
        onCompletedChange?.(nextValue)
        return nextValue
      })
    }

    window.setTimeout(() => {
      setActiveAction(null)
    }, 450)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => handleAction('favorite')}
        className={[
          'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md',
          activeAction === 'favorite'
            ? 'border-[#31583b] bg-[#31583b] text-[#fffdf8]'
            : 'border-[#eadfce] bg-[#fffdf8] text-[#111111] hover:border-[#31583b]/35 hover:bg-[#f2f8f1] hover:text-[#31583b]',
        ].join(' ')}
        aria-label="Dodaj med priljubljene"
        title="Priljubljeno"
      >
        <Heart className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => handleAction('save')}
        className={[
          'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md',
          activeAction === 'save'
            ? 'border-[#d07a12] bg-[#d07a12] text-[#fffdf8]'
            : 'border-[#eadfce] bg-[#fffdf8] text-[#111111] hover:border-[#d07a12]/45 hover:bg-[#fff6eb] hover:text-[#d07a12]',
        ].join(' ')}
        aria-label="Shrani za pozneje"
        title="Shrani"
      >
        <Bookmark className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => handleAction('completed')}
        className={[
          'group inline-flex h-12 min-w-[210px] flex-1 items-center justify-center gap-2.5 rounded-full border px-5 text-sm font-bold shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(49,88,59,0.14)] sm:flex-none',
          localIsCompleted
            ? 'border-[#b7d7bd] bg-[#f2f8f1] text-[#31583b] shadow-[0_10px_24px_rgba(49,88,59,0.08)]'
            : activeAction === 'completed'
              ? 'border-[#31583b] bg-[#31583b] text-[#fffdf8]'
              : 'border-[#31583b]/75 bg-[#3f6b49] text-[#fffdf8] hover:border-[#31583b] hover:bg-[#31583b]',
        ].join(' ')}
        aria-pressed={localIsCompleted}
      >
        <CheckCircle2 className="h-5 w-5" />
        {localIsCompleted ? 'Končano' : 'Označi kot dokončano'}
      </button>
    </div>
  )
}

export type LearningPathOverviewCardProps = {
  durationLabel: string
  moduleCount: number
  learningUnitCount: number
  hiddenNodeCount?: number
  isCompleted: boolean
  onFavoriteClick?: () => void
  onSaveClick?: () => void
  onCompletedChange?: (isCompleted: boolean) => void
  className?: string
}

export function LearningPathOverviewCard({
  durationLabel,
  moduleCount,
  learningUnitCount,
  hiddenNodeCount = 0,
  isCompleted,
  onFavoriteClick,
  onSaveClick,
  onCompletedChange,
  className = '',
}: LearningPathOverviewCardProps) {
  return (
    <div
      className={[
        'rounded-[1.6rem] bg-white/92 p-4 shadow-md backdrop-blur sm:p-5',
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6F7F58]">
            Pregled poti
          </p>

          {hiddenNodeCount > 0 && (
            <p className="mt-2 text-sm text-[#6b6258]">
              +{hiddenNodeCount} dodatnih modulov
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Trajanje',
            value: durationLabel,
            icon: <Clock className="h-5 w-5" />,
          },
          {
            label: 'Moduli',
            value: String(moduleCount),
            icon: <Layers3 className="h-5 w-5" />,
          },
          {
            label: 'Učne enote',
            value: String(learningUnitCount),
            icon: <BookOpen className="h-5 w-5" />,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl bg-[#F7F1E6]/75 px-3 py-3"
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#344E41] shadow-sm">
              {item.icon}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-wide text-[#6F7F58]">
              {item.label}
            </p>

            <strong className="mt-1 block text-base font-bold leading-tight text-[#283618]">
              {item.value}
            </strong>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-[#eadfce] pt-5">
        <MountainActions
          isCompleted={isCompleted}
          onFavoriteClick={onFavoriteClick}
          onSaveClick={onSaveClick}
          onCompletedChange={onCompletedChange}
        />
      </div>
    </div>
  )
}

function createWavyPathD(
  from: PathPoint,
  to: PathPoint,
  waveCount = 2,
) {
  const deltaX = to.x - from.x
  const deltaY = to.y - from.y
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  if (distance === 0) {
    return `M ${from.x} ${from.y}`
  }

  const pointCount = 28
  const amplitude = Math.min(Math.max(distance * 0.035, 1.4), 3.2)
  const normalX = -deltaY / distance
  const normalY = deltaX / distance

  const points = Array.from({ length: pointCount + 1 }, (_, index) => {
    const progress = index / pointCount
    const fade = Math.sin(Math.PI * progress)
    const wave = Math.sin(progress * Math.PI * 2 * waveCount)
    const offset = wave * amplitude * fade

    return {
      x: from.x + deltaX * progress + normalX * offset,
      y: from.y + deltaY * progress + normalY * offset,
    }
  })

  return points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(' ')
}

export function LearningPathMountain({
  nodes,
  durationLabel,
  moduleCount,
  learningUnitCount,
  isCompleted = false,
  celebrateCompletedOnMount = false,
  onFavoriteClick,
  onSaveClick,
  onCompletedChange,
  className = '',
}: LearningPathMountainProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [completionCelebrationKey, setCompletionCelebrationKey] = useState(0)
  const previousIsCompletedRef = useRef(isCompleted)

  useEffect(() => {
    const wasCompleted = previousIsCompletedRef.current
    previousIsCompletedRef.current = isCompleted

    if (!isCompleted) {
      return
    }

    if (!wasCompleted || celebrateCompletedOnMount) {
      setCompletionCelebrationKey((currentKey) => currentKey + 1)
    }
  }, [celebrateCompletedOnMount, isCompleted])

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

  const hiddenNodeCount = Math.max(moduleCount - MAX_VISIBLE_NODES, 0)

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
          d={createWavyPathD(
            segment.from,
            segment.to,
            segment.isParallelTransition ? 1.5 : 2,
          )}
          fill="none"
          stroke="#344E41"
          strokeWidth="3.45"
          strokeLinecap="round"
          strokeDasharray="1.4 1.25"
          opacity="0.62"
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
      const nodeAssessmentClassName = getNodeAssessmentClassName(
        node.assessmentStatus,
      )      
      return (
        <button
          key={node.id}
          type="button"
          onClick={() => setSelectedNodeId(node.id)}
          className={`absolute z-30 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-bold shadow-lg transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-4 min-[1500px]:h-14 min-[1500px]:w-14 ${nodeAssessmentClassName} ${
            hasParallelLabel
              ? 'text-[0.78rem] min-[1500px]:text-sm'
              : 'text-base min-[1500px]:text-lg'
          } ${className} ${
            isSelected ? 'scale-110 ring-4 ring-[#F8E7BE]/70' : ''
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
      className={[
        'relative isolate overflow-hidden rounded-[2rem] border border-[#DED2BC] bg-[#F7F1E6] shadow-sm',
        className,
      ].join(' ')}
    >
      <style>
        {`
          @keyframes learning-path-flag-pop {
            0% {
              transform: scale(1);
            }

            35% {
              transform: scale(1.22);
            }

            65% {
              transform: scale(0.96);
            }

            100% {
              transform: scale(1);
            }
          }

          @keyframes learning-path-flag-ring {
            0% {
              transform: translate(-50%, -50%) scale(0.45);
              opacity: 0.45;
            }

            100% {
              transform: translate(-50%, -50%) scale(1.45);
              opacity: 0;
            }
          }

          @keyframes learning-path-confetti-piece {
            0% {
              transform: translate(-50%, -50%) scale(0.45) rotate(0deg);
              opacity: 0;
            }

            15% {
              opacity: 1;
            }

            100% {
              transform: translate(
                  calc(-50% + var(--confetti-x)),
                  calc(-50% + var(--confetti-y))
                )
                scale(1)
                rotate(var(--confetti-r));
              opacity: 0;
            }
          }

          .learning-path-flag-pop {
            animation: learning-path-flag-pop 680ms cubic-bezier(0.2, 0.8, 0.2, 1);
          }

          .learning-path-flag-ring {
            animation: learning-path-flag-ring 760ms ease-out forwards;
          }

          .learning-path-confetti-piece {
            animation: learning-path-confetti-piece 860ms cubic-bezier(0.16, 1, 0.3, 1)
              forwards;
          }
        `}
      </style>
      <picture>
        <source srcSet={mountainJourneyBgMobile} media="(max-width: 999px)" />
        <img
          src={mountainJourneyBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden="true"
        />
      </picture>

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#fffdf8]/45 via-[#fffdf8]/20 to-[#fffdf8]/10" />

      <LearningPathOverviewCard
        durationLabel={durationLabel}
        moduleCount={moduleCount}
        learningUnitCount={learningUnitCount}
        hiddenNodeCount={hiddenNodeCount}
        isCompleted={isCompleted}
        onFavoriteClick={onFavoriteClick}
        onSaveClick={onSaveClick}
        onCompletedChange={(nextIsCompleted) => {
          if (nextIsCompleted) {
            setCompletionCelebrationKey((currentKey) => currentKey + 1)
          }

          onCompletedChange?.(nextIsCompleted)
        }}
        className="absolute left-3 right-3 top-3 z-40 hidden max-w-full sm:left-6 sm:right-auto sm:top-6 sm:w-[430px] sm:max-w-[calc(100%-3rem)] min-[1000px]:block min-[1500px]:left-8 min-[1500px]:top-8 min-[1500px]:w-[460px]"
      />

      <div className="absolute right-20 top-24 z-30 hidden rounded-full bg-white/80 px-5 py-2 text-xs font-bold uppercase tracking-[0.26em] text-[#344E41] shadow-sm backdrop-blur md:block">
        Klikni modul
      </div>

      {renderPathSegments(desktopAllPathSegments, 'hidden min-[1500px]:block')}
      {renderPathSegments(
        tabletAllPathSegments,
        'hidden min-[1000px]:block min-[1500px]:hidden',
      )}
      {renderPathSegments(mobileAllPathSegments, 'min-[1000px]:hidden')}

      <FinishFlag
        position={desktopFinishFlagPosition}
        isCompleted={isCompleted}
        celebrationKey={completionCelebrationKey}
        className="hidden min-[1500px]:flex"
      />

      <FinishFlag
        position={tabletFinishFlagPosition}
        isCompleted={isCompleted}
        celebrationKey={completionCelebrationKey}
        className="hidden min-[1000px]:flex min-[1500px]:hidden"
      />

      <FinishFlag
        position={mobileFinishFlagPosition}
        isCompleted={isCompleted}
        celebrationKey={completionCelebrationKey}
        className="flex min-[1000px]:hidden"
      />

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
        <div className="absolute inset-x-3 bottom-3 z-50 min-[1000px]:hidden">
          <ModuleDetailBox
            node={selectedMobileNode}
            onClose={() => setSelectedNodeId(null)}
            className="max-h-[72vh] overflow-y-auto"
          />
        </div>
      )}

      <div className="absolute bottom-6 right-6 z-20 hidden text-right text-xs font-bold uppercase tracking-[0.24em] text-[#344E41]/75 md:block">
        {isCompleted ? 'Cilj dosežen' : 'Cilj poti'}
      </div>
    </section>
  )
}