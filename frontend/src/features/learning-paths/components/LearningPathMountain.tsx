import { useEffect, useMemo, useState, useRef, useId } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  ChevronRight,
  Clock,
  Flag,
  Heart,
  Layers3,
} from 'lucide-react'

import mountainJourneyBg from '../../../assets/mountain-journey-bg.webp'
import mountainJourneyBgMobile from '../../../assets/mountain-journey-bg_mobile.webp'
import type { AssessmentStatus } from '../../../types/assessment'
import AssessmentPositionMarker from '../../../components/detail/AssessmentPositionMarker'

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
  assessmentProgress?: number | null
  isAssessmentPosition?: boolean
  nodeType?: 'module' | 'learning_unit'
  detailPath?: string
  questionYesCount?: number | null
  questionMissingCount?: number | null
  questionTotalCount?: number | null
}

type PositionedMountainNode = LearningPathMountainNode & {
  x: number
  y: number
  displayLabel: string
  parallelIndex: number
  parallelCount: number
  levelIndex: number
}

type LearningPathMountainProps = {
  nodes: LearningPathMountainNode[]
  durationLabel: string
  moduleCount: number
  learningUnitCount: number
  isFavorite?: boolean
  isSaved?: boolean
  isCompleted?: boolean
  celebrateCompletedOnMount?: boolean
  onFavoriteClick?: () => void
  onSaveClick?: () => void
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
  levelIndex: number
}

type LayoutVariant = 'mobile' | 'tablet' | 'desktop'

type MountainAction = 'favorite' | 'save' | null


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

const tabletLevelPositionPresets: Record<number, Position[]> = desktopLevelPositionPresets

const mobileLevelPositionPresets: Record<number, Position[]> = {
  1: [{ x: 42, y: 72 }],
  2: [
    { x: 34, y: 82 },
    { x: 48, y: 55 },
  ],
  3: [
    { x: 31, y: 84 },
    { x: 43, y: 66 },
    { x: 52, y: 48 },
  ],
  4: [
    { x: 28, y: 85 },
    { x: 39, y: 72 },
    { x: 48, y: 58 },
    { x: 53, y: 43 },
  ],
  5: [
    { x: 26, y: 86 },
    { x: 36, y: 76 },
    { x: 45, y: 64 },
    { x: 51, y: 51 },
    { x: 53, y: 39 },
  ],
  6: [
    { x: 24, y: 86 },
    { x: 33, y: 78 },
    { x: 42, y: 68 },
    { x: 49, y: 58 },
    { x: 53, y: 48 },
    { x: 53, y: 38 },
  ],
  7: [
    { x: 22, y: 87 },
    { x: 31, y: 80 },
    { x: 40, y: 72 },
    { x: 47, y: 63 },
    { x: 52, y: 54 },
    { x: 54, y: 45 },
    { x: 53, y: 36 },
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

const desktopFinishFlagPosition: Position = { x: 74.5, y: 10.5 }
const tabletFinishFlagPosition: Position = desktopFinishFlagPosition
const mobileFinishFlagPosition: Position = { x: 54, y: 21 }

const DESKTOP_BLOCK_CLASS = 'hidden min-[1500px]:block'
const TABLET_BLOCK_CLASS = 'hidden min-[640px]:max-[1499px]:block'
const MOBILE_BLOCK_CLASS = 'block min-[640px]:hidden'

const DESKTOP_FLEX_CLASS = 'hidden min-[1500px]:flex'
const TABLET_FLEX_CLASS = 'hidden min-[640px]:max-[1499px]:flex'
const MOBILE_FLEX_CLASS = 'flex min-[640px]:hidden'

const DESKTOP_FLAG_CLASS = 'hidden min-[1500px]:block'
const TABLET_FLAG_CLASS = 'hidden min-[640px]:max-[1499px]:block'
const MOBILE_FLAG_CLASS = 'block min-[640px]:hidden'

const DESKTOP_DETAIL_CLASS = 'absolute z-50 hidden w-[390px] min-[1500px]:block'
const TABLET_DETAIL_CLASS =
  'absolute z-[90] hidden w-[240px] max-h-[calc(100%-2rem)] overflow-y-auto min-[640px]:max-[1499px]:block min-[900px]:w-[240px] min-[1200px]:w-[240px]'

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

function getTabletDetailStyle(): CSSProperties {
  return {
    left: '68%',
    top: '52%',
    transform: 'translate(-50%, -50%)',
  }
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
        levelIndex,
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
            levelIndex,
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
        levelIndex,
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
  const levelIndex = Math.max(0, levels.length - 1)

  return lastLevel.map((node) => ({
    from: node,
    to: {
      id: 'finish-flag',
      x: finishPosition.x,
      y: finishPosition.y,
    },
    isParallelTransition,
    levelIndex,
  }))
}

function FinishFlag({
  position,
  isCompleted,
  celebrationKey = 0,
  className = '',
  delay = 0,
  isContainerInView = true,
}: {
  position: Position
  isCompleted: boolean
  celebrationKey?: number
  className?: string
  delay?: number
  isContainerInView?: boolean
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
    <motion.div
      className={[
        'absolute z-30 -translate-x-1/2 -translate-y-1/2',
        className,
      ].join(' ')}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isContainerInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
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
    </motion.div>
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
  const isLearningUnit = node.nodeType === 'learning_unit'
  const kindLabel = isLearningUnit ? 'Učna enota' : 'Modul'
  const detailPath =
    node.detailPath ??
    (isLearningUnit
      ? `/learning-units/${node.moduleId}`
      : `/modules/${node.moduleId}`)

  const description = node.description.trim()

  return (
    <article
      className={[
        'rounded-[18px] border border-[#DED2BC] bg-[#fffdf8] p-3.5 shadow-[0_18px_45px_rgba(49,88,59,0.13)] min-[1500px]:rounded-[24px] min-[1500px]:p-5',
        className,
      ].join(' ')}
      style={style}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[var(--color-brown-500)]">
            {kindLabel} {node.displayLabel}
          </p>

          <h3 className="mt-2 font-serif text-2xl leading-tight tracking-[-0.03em] text-[var(--color-brown-900)] min-[1500px]:text-3xl">
            {node.title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DED2BC] bg-[#fffdf8] text-[var(--color-brown-900)] transition hover:-translate-y-0.5 hover:bg-[#f6efdf]"
          aria-label="Zapri podrobnosti"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#f6efdf] px-3.5 py-1.5 text-xs font-bold text-[var(--color-brown-700)] min-[1500px]:px-4 min-[1500px]:py-2 min-[1500px]:text-sm">
          {formatModuleDuration(node.durationHours)}
        </span>

        <span
          className={[
            'rounded-full px-3.5 py-1.5 text-xs font-bold min-[1500px]:px-4 min-[1500px]:py-2 min-[1500px]:text-sm',
            node.isRequired
              ? 'bg-[#eaf2e5] text-[#31583b]'
              : 'bg-[#f3ead8] text-[var(--color-brown-700)]',
          ].join(' ')}
        >
          {node.isRequired ? 'Obvezno' : 'Izbirno'}
        </span>
      </div>

      {description && (
        <div className="mt-4 rounded-2xl border border-[#eadfce] bg-[#fff8ee]/70 p-3">
          <p className="mt-1 text-sm leading-6 text-[#51685a]">
            {description}
          </p>
        </div>
      )}

      <Link
        to={detailPath}
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#31583b] px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#27462f]"
      >
        Podrobnosti
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  )
}

function normalizeAssessmentProgress(progress?: number | null) {
  if (progress == null || Number.isNaN(progress)) {
    return null
  }

  return Math.min(Math.max(progress, 0), 1)
}

function isStatsNodeCompleted(node: LearningPathMountainNode) {
  return (
    node.assessmentStatus === 'completed' ||
    normalizeAssessmentProgress(node.assessmentProgress) === 1
  )
}

function getStatsNodeProgress(node: LearningPathMountainNode) {
  if (isStatsNodeCompleted(node)) {
    return 1
  }

  return normalizeAssessmentProgress(node.assessmentProgress) ?? 0
}

function getSortedStatsNodes(nodes: LearningPathMountainNode[]) {
  return nodes.slice().sort((firstNode, secondNode) => {
    if (firstNode.order !== secondNode.order) {
      return firstNode.order - secondNode.order
    }

    return firstNode.title.localeCompare(secondNode.title, 'sl')
  })
}

type LearningPathStatsNextStepItem = {
  id: string
  badge: string
  kindLabel: string
  title: string
}

function getStatsNodeKindLabel(node: LearningPathMountainNode) {
  return node.nodeType === 'learning_unit' ? 'Učna enota' : 'Modul'
}

function sortStatsLevelNodes(nodes: LearningPathMountainNode[]) {
  return nodes.slice().sort((firstNode, secondNode) => {
    const firstParallelGroup = firstNode.parallelGroup ?? ''
    const secondParallelGroup = secondNode.parallelGroup ?? ''

    if (firstParallelGroup !== secondParallelGroup) {
      return firstParallelGroup.localeCompare(secondParallelGroup, 'sl')
    }

    return firstNode.title.localeCompare(secondNode.title, 'sl')
  })
}

function getCurrentIncompleteStatsLevel(nodes: LearningPathMountainNode[]) {
  const levels = new Map<number, LearningPathMountainNode[]>()

  nodes.forEach((node) => {
    const existingLevel = levels.get(node.order) ?? []
    existingLevel.push(node)
    levels.set(node.order, existingLevel)
  })

  return (
    Array.from(levels.entries())
      .sort(([firstOrder], [secondOrder]) => firstOrder - secondOrder)
      .map(([, levelNodes]) => sortStatsLevelNodes(levelNodes))
      .find((levelNodes) => levelNodes.some((node) => !isStatsNodeCompleted(node))) ??
    []
  )
}

function getStatsNextStepItems(levelNodes: LearningPathMountainNode[]) {
  const sortedLevelNodes = sortStatsLevelNodes(levelNodes)
  const isParallelLevel = sortedLevelNodes.length > 1

  const items = sortedLevelNodes
    .map((node, index) => ({ node, index }))
    .filter(({ node }) => !isStatsNodeCompleted(node))
    .map(({ node, index }) => ({
      id: node.id,
      badge: isParallelLevel
        ? `${node.order}${PARALLEL_LABELS[index] ?? index + 1}`
        : String(node.order),
      kindLabel: getStatsNodeKindLabel(node),
      title: node.title,
    }))

  return {
    items,
    isParallelLevel,
  }
}

function getStatsAnsweredQuestionCount(node: LearningPathMountainNode) {
  return (node.questionYesCount ?? 0) + (node.questionMissingCount ?? 0)
}

function hasStatsAssessmentStarted(node: LearningPathMountainNode) {
  return (
    getStatsAnsweredQuestionCount(node) > 0 ||
    getStatsNodeProgress(node) > 0 ||
    node.assessmentStatus != null ||
    node.assessmentProgress != null ||
    node.isAssessmentPosition === true
  )
}

function getQuestionAnswerStats(
  nodes: LearningPathMountainNode[],
  isFullyCompleted: boolean,
) {
  const totalCount = nodes.length

  const totalProgress = nodes.reduce(
    (sum, node) => sum + getStatsNodeProgress(node),
    0,
  )

  const questionPercent =
    totalCount > 0
      ? Math.round((totalProgress / totalCount) * 100)
      : isFullyCompleted
        ? 100
        : 0

  return {
    questionPercent,
    hasStarted:
      isFullyCompleted || nodes.some((node) => hasStatsAssessmentStarted(node)),
  }
}

function isStatsPreviousLevelCompleted(
  node: LearningPathMountainNode,
  sortedNodes: LearningPathMountainNode[],
) {
  const previousOrders = sortedNodes
    .map((candidateNode) => candidateNode.order)
    .filter((order) => order < node.order)
    .sort((firstOrder, secondOrder) => firstOrder - secondOrder)

  const previousOrder = previousOrders.at(-1)

  if (previousOrder === undefined) {
    return true
  }

  const previousLevelNodes = sortedNodes.filter(
    (candidateNode) => candidateNode.order === previousOrder,
  )

  return previousLevelNodes.every(isStatsNodeCompleted)
}

function isStatsExactNextStartNode(
  node: LearningPathMountainNode,
  sortedNodes: LearningPathMountainNode[],
) {
  const progress = normalizeAssessmentProgress(node.assessmentProgress) ?? 0

  return (
    node.isAssessmentPosition === true &&
    progress <= 0 &&
    isStatsPreviousLevelCompleted(node, sortedNodes)
  )
}

function getLearningPathStats(
  nodes: LearningPathMountainNode[],
) {
  const sortedNodes = getSortedStatsNodes(nodes)
  const totalCount = sortedNodes.length

  if (totalCount === 0) {
    return {
      completedCount: 0,
      totalCount: 0,
      questionPercent: 0,
      hasStarted: false,
      nextStepLabel: 'Naslednji korak',
      nextStepTitle: 'Koraki učne poti še niso pripravljeni.',
      nextStepItems: [] as LearningPathStatsNextStepItem[],
      nextStepIsParallel: false,
      isFullyCompleted: false,
    }
  }

  const completedCount = sortedNodes.filter(isStatsNodeCompleted).length

  const isFullyCompleted = completedCount === totalCount

  const questionStats = getQuestionAnswerStats(sortedNodes, isFullyCompleted)

  const shouldPromptQuestionnaire =
    !isFullyCompleted &&
    completedCount === 0 &&
    !questionStats.hasStarted

  if (isFullyCompleted) {
    return {
      completedCount: totalCount,
      totalCount,
      ...questionStats,
      nextStepLabel: 'Zaključeno',
      nextStepTitle: 'Učna pot je uspešno zaključena.',
      nextStepItems: [] as LearningPathStatsNextStepItem[],
      nextStepIsParallel: false,
      isFullyCompleted: true,
    }
  }

  if (shouldPromptQuestionnaire) {
    return {
      completedCount,
      totalCount,
      ...questionStats,
      nextStepLabel: 'Naslednji korak',
      nextStepTitle: 'Izpolni vprašalnik',
      nextStepItems: [] as LearningPathStatsNextStepItem[],
      nextStepIsParallel: false,
      isFullyCompleted: false,
    }
  }

  const currentLevelNodes = getCurrentIncompleteStatsLevel(sortedNodes)
  const { items: nextStepItems, isParallelLevel: nextStepIsParallel } =
    getStatsNextStepItems(currentLevelNodes)

  const hasStartedCurrentLevel = currentLevelNodes.some(
    (node) => !isStatsNodeCompleted(node) && getStatsNodeProgress(node) > 0,
  )

  const hasExactStartNode = currentLevelNodes.some(
    (node) =>
      !isStatsNodeCompleted(node) &&
      isStatsExactNextStartNode(node, sortedNodes),
  )

  const nextStepLabel =
    nextStepIsParallel && nextStepItems.length > 1
      ? hasStartedCurrentLevel
        ? 'Nadaljuj z vzporednimi koraki'
        : hasExactStartNode
          ? 'Prični z vzporednimi koraki'
          : 'Vzporedni koraki'
      : hasStartedCurrentLevel
        ? 'Nadaljuj z'
        : hasExactStartNode
          ? 'Prični z'
          : 'Naslednji korak'

  const nextStepTitle =
    nextStepItems.length === 0
      ? 'Naslednji korak še ni določen.'
      : nextStepItems.length === 1
        ? nextStepItems[0].title
        : `${nextStepItems.length} možnosti za nadaljevanje`

  return {
    completedCount,
    totalCount,
    ...questionStats,
    nextStepLabel,
    nextStepTitle,
    nextStepItems,
    nextStepIsParallel,
    isFullyCompleted: false,
  }
}

function LearningPathProgressStats({
  nodes,
}: {
  nodes: LearningPathMountainNode[]
}) {
  const stats = getLearningPathStats(nodes)

  const questionPercentLabel =
    stats.hasStarted || stats.isFullyCompleted
      ? `${stats.questionPercent}%`
      : '—'

  const questionRatioLabel =
    stats.hasStarted
      ? `skupnega napredka`
      : stats.isFullyCompleted
        ? 'Učna pot zaključena'
        : 'Še ni odgovorov'

  return (
    <section
      className="absolute left-4 top-4 z-20 hidden w-[280px] rounded-[1.35rem] border border-[#eadfce]/90 bg-[#fffdf8]/95 p-3 text-[#344E41] shadow-[0_18px_45px_rgba(49,88,59,0.12)] backdrop-blur-md min-[875px]:block min-[1024px]:w-[300px] min-[1500px]:left-8 min-[1500px]:top-8 min-[1500px]:w-[420px] min-[1500px]:rounded-[1.6rem] min-[1500px]:p-4"
      aria-label="Statistika učne poti"
    >
      <div className="mb-2 min-[1500px]:mb-3">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.24em] text-[#6f7f58] min-[1500px]:text-[0.68rem] min-[1500px]:tracking-[0.28em]">
          Napredek
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[#eadfce]/80 bg-white/80 p-2.5 shadow-[0_8px_22px_rgba(49,88,59,0.06)] min-[1500px]:rounded-2xl min-[1500px]:p-3">
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.18em] text-[#6f7f58] min-[1500px]:text-[0.64rem] min-[1500px]:tracking-[0.2em]">
            Končano
          </p>

          <p className="mt-1 text-xl font-black text-[#24382d] min-[1500px]:text-2xl">
            {stats.completedCount}/{stats.totalCount}
          </p>

          <p className="mt-0.5 text-[0.62rem] font-semibold text-[#6f7f58] min-[1500px]:mt-1 min-[1500px]:text-[0.7rem]">
            modulov / enot
          </p>
        </div>

        <div className="rounded-xl border border-[#eadfce]/80 bg-white/80 p-2.5 shadow-[0_8px_22px_rgba(49,88,59,0.06)] min-[1500px]:rounded-2xl min-[1500px]:p-3">
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.18em] text-[#6f7f58] min-[1500px]:text-[0.64rem] min-[1500px]:tracking-[0.2em]">
            Potrjeno znanje
          </p>

          <p className="mt-1 text-xl font-black text-[#24382d] min-[1500px]:text-2xl">
            {questionPercentLabel}
          </p>

          <p className="mt-0.5 text-[0.62rem] font-semibold text-[#6f7f58] min-[1500px]:mt-1 min-[1500px]:text-[0.7rem]">
            {questionRatioLabel}
          </p>
        </div>
      </div>

      <div className="mt-2.5 overflow-hidden rounded-full bg-[#efe7d8] min-[1500px]:mt-3">
        <div
          className={[
            'h-1.5 rounded-full transition-all duration-500 min-[1500px]:h-2',
            stats.isFullyCompleted ? 'bg-[#31583b]' : 'bg-[#d08a34]',
          ].join(' ')}
          style={{ width: `${stats.questionPercent}%` }}
        />
      </div>
      <div className="mt-2.5 rounded-xl border border-[#eadfce]/80 bg-[#f8f3e8]/80 p-2.5 min-[1500px]:mt-3 min-[1500px]:rounded-2xl min-[1500px]:p-3">
        <p className="text-[0.56rem] font-bold uppercase tracking-[0.18em] text-[#6f7f58] min-[1500px]:text-[0.64rem] min-[1500px]:tracking-[0.2em]">
          {stats.nextStepLabel}
        </p>

        {stats.nextStepItems.length > 1 ? (
          <ul className="mt-2 space-y-1.5">
            {stats.nextStepItems.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2 rounded-xl border border-[#eadfce]/70 bg-white/65 px-2.5 py-2"
              >
                <span className="mt-0.5 flex h-6 min-w-8 items-center justify-center rounded-full bg-[#31583b] px-2 text-[0.65rem] font-black text-[#fffdf8]">
                  {item.badge}
                </span>

                <span className="min-w-0">
                  <span className="block text-[0.56rem] font-bold uppercase tracking-[0.16em] text-[#6f7f58]">
                    {item.kindLabel}
                  </span>

                  <span className="line-clamp-2 block text-xs font-semibold leading-snug text-[#24382d] min-[1500px]:text-sm">
                    {item.title}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : stats.nextStepItems.length === 1 && stats.nextStepIsParallel ? (
          <div className="mt-2 flex items-start gap-2 rounded-xl border border-[#eadfce]/70 bg-white/65 px-2.5 py-2">
            <span className="mt-0.5 flex h-6 min-w-8 items-center justify-center rounded-full bg-[#31583b] px-2 text-[0.65rem] font-black text-[#fffdf8]">
              {stats.nextStepItems[0].badge}
            </span>

            <span className="min-w-0">
              <span className="block text-[0.56rem] font-bold uppercase tracking-[0.16em] text-[#6f7f58]">
                {stats.nextStepItems[0].kindLabel}
              </span>

              <span className="line-clamp-2 block text-xs font-semibold leading-snug text-[#24382d] min-[1500px]:text-sm">
                {stats.nextStepItems[0].title}
              </span>
            </span>
          </div>
        ) : (
          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-[#24382d] min-[1500px]:text-base">
            {stats.nextStepTitle}
          </p>
        )}
      </div>
    </section>
  )
}

function isMountainNodeCompleted(node: PositionedMountainNode) {
  return (
    node.assessmentStatus === 'completed' ||
    normalizeAssessmentProgress(node.assessmentProgress) === 1
  )
}

function isPreviousLevelCompleted(
  node: PositionedMountainNode,
  nodesToRender: PositionedMountainNode[],
) {
  const previousOrders = nodesToRender
    .map((candidateNode) => candidateNode.order)
    .filter((order) => order < node.order)
    .sort((firstOrder, secondOrder) => firstOrder - secondOrder)

  const previousOrder = previousOrders.at(-1)

  if (previousOrder === undefined) {
    return true
  }

  const previousLevelNodes = nodesToRender.filter(
    (candidateNode) => candidateNode.order === previousOrder,
  )

  return previousLevelNodes.every(isMountainNodeCompleted)
}

function isExactNextStartNode(
  node: PositionedMountainNode,
  nodesToRender: PositionedMountainNode[],
) {
  const progress = normalizeAssessmentProgress(node.assessmentProgress) ?? 0

  return (
    node.isAssessmentPosition === true &&
    progress <= 0 &&
    isPreviousLevelCompleted(node, nodesToRender)
  )
}

function getMountainNodeProgressLabel(
  node: PositionedMountainNode,
  nodesToRender: PositionedMountainNode[],
) {
  const progress = normalizeAssessmentProgress(node.assessmentProgress)

  if (node.assessmentStatus === 'completed' || progress === 1) {
    return '✓100%'
  }

  if (progress == null) {
    return null
  }

  if (progress > 0) {
    return `NADALJUJ`
  }

  if (isExactNextStartNode(node, nodesToRender)) {
    return `PRIČNI`
  }

  return null
}

type MountainNodeProgressBadgeVariant = 'completed' | 'start' | 'progress'

function getMountainNodeProgressBadgeVariant(
  node: PositionedMountainNode,
  nodesToRender: PositionedMountainNode[],
): MountainNodeProgressBadgeVariant {
  const progress = normalizeAssessmentProgress(node.assessmentProgress)

  if (node.assessmentStatus === 'completed' || progress === 1) {
    return 'completed'
  }

  if (isExactNextStartNode(node, nodesToRender)) {
    return 'start'
  }

  return 'progress'
}

function getMountainNodeAssessmentClassName(node: PositionedMountainNode) {
  if (node.isAssessmentPosition) {
    return 'border-[#d08a34] bg-[#d08a34] text-white shadow-[0_16px_34px_rgba(208,138,52,0.28)]'
  }

  if (node.assessmentStatus === 'completed') {
    return 'border-[#b7d7bd] bg-[#31583b] text-[#fffdf8] shadow-[0_14px_30px_rgba(49,88,59,0.18)]'
  }

  if (node.assessmentStatus === 'partially_completed') {
    return 'border-[#f2c879] bg-[#fff8ee] text-[#8a5a17] shadow-[0_12px_28px_rgba(208,138,52,0.14)]'
  }

  return 'border-[#eadfce] bg-[#fffdf8] text-[#344E41] shadow-[0_10px_24px_rgba(49,88,59,0.08)]'
}

function MountainNodeProgressBadge({
  label,
  variant,
  progress,
}: {
  label: string
  variant: MountainNodeProgressBadgeVariant
  progress: number
}) {
  const progressBarWidth = `${Math.min(Math.max(progress, 0), 1) * 100}%`

  return (
    <div
      className={[
        'pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 overflow-hidden whitespace-nowrap rounded-full border text-[0.5rem] font-extrabold uppercase leading-none tracking-[0.08em] shadow-[0_8px_18px_rgba(49,88,59,0.12)] backdrop-blur',
        'min-[640px]:mt-1.5 min-[640px]:text-[0.56rem]',
        'min-[1500px]:mt-2 min-[1500px]:text-[0.64rem]',
        variant === 'completed'
          ? 'border-[#b7d7bd] bg-[#31583b] text-[#fffdf8]'
          : '',
        variant === 'start'
          ? 'border-[#d08a34]/40 bg-white/94 text-[#8a5a17]'
          : '',
        variant === 'progress'
          ? 'border-[#DED2BC] bg-white/94 text-[#344E41]'
          : '',
      ].join(' ')}
    >
      {variant !== 'completed' && (
        <span
          aria-hidden="true"
          className={[
            'absolute inset-y-0 left-0 z-0 transition-[width] duration-500 ease-out',
            variant === 'start' ? 'bg-[#d08a34]/30' : 'bg-[#d08a34]/42',
          ].join(' ')}
          style={{ width: progressBarWidth }}
        />
      )}

      <span className="relative z-10 block px-2 py-1 min-[1500px]:px-2.5">
        {label}
      </span>
    </div>
  )
}

function MountainActions({
  isFavorite,
  isSaved,
  onFavoriteClick,
  onSaveClick,
}: {
  isFavorite: boolean
  isSaved: boolean
  onFavoriteClick?: () => void
  onSaveClick?: () => void
}) {
  const [activeAction, setActiveAction] = useState<MountainAction>(null)

  function handleAction(action: Exclude<MountainAction, null>) {
    setActiveAction(action)

    if (action === 'favorite') {
      onFavoriteClick?.()
    }

    if (action === 'save') {
      onSaveClick?.()
    }

    window.setTimeout(() => {
      setActiveAction(null)
    }, 450)
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => handleAction('favorite')}
        className={[
          'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md',
          isFavorite || activeAction === 'favorite'
            ? 'border-[#31583b] bg-[#31583b] text-[#fffdf8] shadow-[0_10px_24px_rgba(49,88,59,0.18)]'
            : 'border-[#eadfce] bg-[#fffdf8] text-[#111111] hover:border-[#31583b]/35 hover:bg-[#f2f8f1] hover:text-[#31583b]',
        ].join(' ')}
        aria-label={
          isFavorite ? 'Odstrani iz priljubljenih' : 'Dodaj med priljubljene'
        }
        aria-pressed={isFavorite}
        title={isFavorite ? 'Priljubljeno' : 'Dodaj med priljubljene'}
      >
        <Heart className={isFavorite ? 'h-5 w-5 fill-current' : 'h-5 w-5'} />
      </button>

      <button
        type="button"
        onClick={() => handleAction('save')}
        className={[
          'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md',
          isSaved || activeAction === 'save'
            ? 'border-[#d07a12] bg-[#d07a12] text-[#fffdf8] shadow-[0_10px_24px_rgba(208,122,18,0.18)]'
            : 'border-[#eadfce] bg-[#fffdf8] text-[#111111] hover:border-[#d07a12]/45 hover:bg-[#fff6eb] hover:text-[#d07a12]',
        ].join(' ')}
        aria-label={isSaved ? 'Odstrani iz shranjenih' : 'Shrani za pozneje'}
        aria-pressed={isSaved}
        title={isSaved ? 'Shranjeno' : 'Shrani'}
      >
        <Bookmark className={isSaved ? 'h-5 w-5 fill-current' : 'h-5 w-5'} />
      </button>
    </div>
  )
}

export type LearningPathOverviewCardProps = {
  durationLabel: string
  moduleCount: number
  learningUnitCount: number
  hiddenNodeCount?: number
  isFavorite?: boolean
  isSaved?: boolean
  onFavoriteClick?: () => void
  onSaveClick?: () => void
  className?: string
}

export function LearningPathOverviewCard({
  durationLabel,
  moduleCount,
  learningUnitCount,
  hiddenNodeCount = 0,
  isFavorite = false,
  isSaved = false,
  onFavoriteClick,
  onSaveClick,
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

        <MountainActions
          isFavorite={isFavorite}
          isSaved={isSaved}
          onFavoriteClick={onFavoriteClick}
          onSaveClick={onSaveClick}
        />
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

const detailBoxTransition = {
  duration: 1.5,
  ease: [0.22, 1, 0.36, 1],
} as const

function AnimatedModuleDetailBox({
  node,
  onClose,
  containerClassName = '',
  containerStyle,
  boxClassName = '',
}: {
  node: PositionedMountainNode
  onClose: () => void
  containerClassName?: string
  containerStyle?: CSSProperties
  boxClassName?: string
}) {
  return (
    <div className={containerClassName} style={containerStyle}>
      <AnimatePresence mode="wait">
        <motion.div
          key={node.id}
          className="w-full"
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={detailBoxTransition}
        >
          <ModuleDetailBox
            node={node}
            onClose={onClose}
            className={boxClassName}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function LearningPathMountain({
  nodes,
  isCompleted = false,
  celebrateCompletedOnMount = false,
  className = '',
}: LearningPathMountainProps) {
  const componentId = useId().replace(/:/g, '')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [completionCelebrationKey, setCompletionCelebrationKey] = useState(0)
  const previousIsCompletedRef = useRef(isCompleted)
  const containerRef = useRef<HTMLElement>(null)
  const isContainerInView = useInView(containerRef, { once: true, margin: "-100px" })

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

  function renderPathSegments(segments: PathSegment[], className: string, variant: string) {
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
        {segments.map((segment) => {
          const delay = segment.levelIndex * 0.8;
          const maskId = `mask-${variant}-${componentId}-${segment.from.id}-${segment.to.id}`;
          const pathD = createWavyPathD(
            segment.from,
            segment.to,
            segment.isParallelTransition ? 1.5 : 2,
          );

          return (
            <g key={`${segment.from.id}-${segment.to.id}`}>
              <defs>
                <mask id={maskId}>
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke="white"
                    strokeWidth="10"
                    strokeLinecap="butt"
                    initial={{ pathLength: 0 }}
                    animate={isContainerInView ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{
                      pathLength: { duration: 0.8, delay, ease: "linear" }
                    }}
                  />
                </mask>
              </defs>
              <path
                d={pathD}
                fill="none"
                stroke="#344E41"
                strokeWidth="3.45"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity="0.62"
                mask={`url(#${maskId})`}
              />
            </g>
          )
        })}
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
      const nodeAssessmentClassName = getMountainNodeAssessmentClassName(node)
      const nodeProgressLabel = getMountainNodeProgressLabel(node, nodesToRender)
      const nodeProgressBadgeVariant = getMountainNodeProgressBadgeVariant(
        node,
        nodesToRender,
      )
      const nodeProgress = normalizeAssessmentProgress(node.assessmentProgress) ?? 0
      const nodeDelay = node.levelIndex * 0.8;

      return (
        <motion.div
          key={`${node.id}-${className}`}
          className={[
            'absolute z-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center',
            className,
          ].join(' ')}
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isContainerInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, delay: nodeDelay, ease: "easeOut" }}
        >
          {node.isAssessmentPosition && (
            <motion.div 
               className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-0 -translate-x-1/2 translate-y-[6px] min-[640px]:translate-y-[7px] min-[1500px]:translate-y-[8px]"
               initial={{ opacity: 0, y: 10 }}
               animate={isContainerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
               transition={{ duration: 0.5, delay: nodeDelay + 0.3, ease: "easeOut" }}
            >
              <AssessmentPositionMarker label="" />
            </motion.div>
          )}
          <button
            type="button"
            onClick={() => setSelectedNodeId(node.id)}
            className={[
              'relative isolate flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-full border-2 font-bold transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-4 min-[480px]:h-9 min-[480px]:w-9 min-[640px]:h-10 min-[640px]:w-10 min-[1024px]:h-11 min-[1024px]:w-11 min-[1500px]:h-14 min-[1500px]:w-14',
              hasParallelLabel
                ? 'text-[0.58rem] min-[480px]:text-[0.64rem] min-[640px]:text-[0.7rem] min-[1024px]:text-xs min-[1500px]:text-sm'
                : 'text-xs min-[480px]:text-[0.82rem] min-[640px]:text-sm min-[1024px]:text-base min-[1500px]:text-lg',
              nodeAssessmentClassName,
              isSelected ? 'scale-110 ring-4 ring-[#F8E7BE]/70' : '',
            ].join(' ')}
            aria-pressed={isSelected}
            aria-label={`Odpri podrobnosti ${
              node.nodeType === 'learning_unit' ? 'učne enote' : 'modula'
            } ${node.title}`}
            >
            <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.55)]">
              {node.displayLabel}
            </span>
          </button>
          {nodeProgressLabel && (
            <MountainNodeProgressBadge
              label={nodeProgressLabel}
              variant={nodeProgressBadgeVariant}
              progress={nodeProgress}
            />
          )}
        </motion.div>
      )
    })
  }

  return (
    <section
      ref={containerRef}
      className={[
        'relative isolate overflow-hidden rounded-[2rem] border border-[#DED2BC] bg-[#F7F1E6] shadow-sm h-full min-[640px]:!h-auto min-[640px]:!min-h-0 min-[640px]:aspect-[1900/1000]',
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
      <img
        src={mountainJourneyBg}
        alt=""
        className="absolute inset-0 z-0 hidden h-full w-full object-cover object-center min-[640px]:block"
      />

      <img
        src={mountainJourneyBgMobile}
        alt=""
        className="absolute inset-0 z-0 block h-full w-full object-cover object-top min-[640px]:hidden"
      />

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#fffdf8]/45 via-[#fffdf8]/20 to-[#fffdf8]/10" />

      <LearningPathProgressStats nodes={nodes} />

      <div className="absolute right-20 top-24 z-30 hidden rounded-full bg-white/80 px-5 py-2 text-xs font-bold uppercase tracking-[0.26em] text-[#344E41] shadow-sm backdrop-blur min-[1500px]:block">
        Klikni modul/ učno enoto
      </div>

      {renderPathSegments(desktopAllPathSegments, DESKTOP_BLOCK_CLASS, 'desktop')}
      {renderPathSegments(tabletAllPathSegments, TABLET_BLOCK_CLASS, 'tablet')}
      {renderPathSegments(mobileAllPathSegments, MOBILE_BLOCK_CLASS, 'mobile')}

      {renderNodes(desktopPositionedNodes, DESKTOP_FLEX_CLASS)}
      {renderNodes(tabletPositionedNodes, TABLET_FLEX_CLASS)}
      {renderNodes(mobilePositionedNodes, MOBILE_FLEX_CLASS)}

      <FinishFlag
        position={desktopFinishFlagPosition}
        isCompleted={isCompleted}
        celebrationKey={completionCelebrationKey}
        className={DESKTOP_FLAG_CLASS}
        delay={desktopNodeLevels.length * 0.8}
        isContainerInView={isContainerInView}
      />

      <FinishFlag
        position={tabletFinishFlagPosition}
        isCompleted={isCompleted}
        celebrationKey={completionCelebrationKey}
        className={TABLET_FLAG_CLASS}
        delay={tabletNodeLevels.length * 0.8}
        isContainerInView={isContainerInView}
      />

      <FinishFlag
        position={mobileFinishFlagPosition}
        isCompleted={isCompleted}
        celebrationKey={completionCelebrationKey}
        className={MOBILE_FLAG_CLASS}
        delay={mobileNodeLevels.length * 0.8}
        isContainerInView={isContainerInView}
      />

      {selectedDesktopNode && (
        <AnimatedModuleDetailBox
          node={selectedDesktopNode}
          onClose={() => setSelectedNodeId(null)}
          containerClassName={DESKTOP_DETAIL_CLASS}
          containerStyle={{
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
        <AnimatedModuleDetailBox
          node={selectedTabletNode}
          onClose={() => setSelectedNodeId(null)}
          containerClassName={TABLET_DETAIL_CLASS}
          containerStyle={getTabletDetailStyle()}
        />
      )}

      {selectedMobileNode && (
        <div className="absolute inset-x-3 bottom-3 z-50 min-[640px]:hidden">
          <AnimatedModuleDetailBox
            node={selectedMobileNode}
            onClose={() => setSelectedNodeId(null)}
            boxClassName="max-h-[72vh] overflow-y-auto"
          />
        </div>
      )}

      <div className="absolute bottom-6 right-6 z-20 hidden text-right text-xs font-bold uppercase tracking-[0.24em] text-[#344E41]/75 min-[640px]:block">
        {isCompleted ? 'Cilj dosežen' : 'Cilj poti'}
      </div>
    </section>
  )
}

