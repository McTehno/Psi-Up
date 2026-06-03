import type { DetailRouteItem } from '../../../components/detail/DetailRouteMap/DetailRouteMap'
import type { AssistantContextType } from '../../assistant'
import {
  getLearningPathDetail,
  getLearningPaths,
} from '../../../services/learning-path-service'
import {
  getModuleDetail,
  getModules,
} from '../../../services/module-service'
import { getLearningUnitDetail } from '../../../services/learning-unit-service'
import { getUserProgress } from '../../../services/user-progress-service'
import type {
  LearningPathDetailResponse,
  LearningPathResponse,
} from '../../../types/learning-path'
import type { LearningUnitResponse } from '../../../types/learning-unit'
import type {
  ModuleDetailResponse,
  ModuleResponse,
} from '../../../types/module'
import type {
  CurrentPositionResponse,
  UserProgressResponse,
} from '../../../types/user-progress'
import {
  buildLearningPathRouteMapItems,
  buildModuleRouteMapItems,
} from './build-detail-route-map'
import { getResponseId } from './get-response-id'

export type DetailTargetType = 'learning_path' | 'module' | 'learning_unit'

export type DetailTargetInfo = {
  type: DetailTargetType
  id: string
}

export type DetailMetaItem = {
  label: string
  value: string | number
}

export type DetailTagsSection = {
  title: string
  description?: string
  tags: string[]
  emptyMessage: string
}

export type DetailViewState = {
  targetType: DetailTargetType
  targetId: string
  assistantContextType: AssistantContextType
  eyebrow: string
  title: string
  description?: string | null
  metaItems: DetailMetaItem[]
  tagsSection?: DetailTagsSection
  routeMapTitle: string
  routeMapDescription: string
  routeMapItems: DetailRouteItem[]
  assessmentUrl: string
}

const DEFAULT_USER_ID = 'user_001'

function formatDuration(durationHours?: number | null) {
  if (!durationHours) {
    return null
  }

  if (!Number.isInteger(durationHours)) {
    return `${durationHours} h`
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

function buildAssessmentUrl(targetType: DetailTargetType, targetId: string) {
  const params = new URLSearchParams({
    target_type: targetType,
    target_id: targetId,
  })

  return `/assessment?${params.toString()}`
}

async function loadUserProgress() {
  try {
    return await getUserProgress(DEFAULT_USER_ID)
  } catch {
    return null
  }
}

function findCurrentPositionByModule(
  moduleId: string,
  userProgress?: UserProgressResponse | null
) {
  return (
    userProgress?.current_positions.find(
      (position) => position.current_module_id === moduleId
    ) ?? null
  )
}

function findCurrentPositionByLearningUnit(
  learningUnitId: string,
  parentModuleId?: string,
  parentLearningPathId?: string,
  userProgress?: UserProgressResponse | null
): CurrentPositionResponse | null {
  return (
    userProgress?.current_positions.find((position) => {
      if (
        parentLearningPathId &&
        position.learning_path_id === parentLearningPathId
      ) {
        return true
      }

      if (parentModuleId && position.current_module_id === parentModuleId) {
        return true
      }

      return position.current_learning_unit_id === learningUnitId
    }) ?? null
  )
}

function buildDurationMeta(durationHours?: number | null): DetailMetaItem[] {
  const duration = formatDuration(durationHours)

  if (!duration) {
    return []
  }

  return [{ label: 'Trajanje', value: duration }]
}

function getTopicTitles(learningUnit: LearningUnitResponse): string[] {
  return learningUnit.content_topics
    .map((topic) => topic.title?.trim())
    .filter((title): title is string => Boolean(title))
}

function buildLearningPathMeta(
  learningPath: LearningPathResponse,
  modules: ModuleResponse[]
): DetailMetaItem[] {
  return [
    ...buildDurationMeta(learningPath.duration_hours),
    { label: 'Moduli', value: modules.length },
  ]
}

function buildModuleMeta(
  module: ModuleResponse,
  learningUnits: LearningUnitResponse[]
): DetailMetaItem[] {
  return [
    ...buildDurationMeta(module.duration_hours),
    { label: 'Učne enote', value: learningUnits.length },
  ]
}

function buildLearningUnitMeta(
  learningUnit: LearningUnitResponse,
  parentModule?: ModuleResponse | null
): DetailMetaItem[] {
  return [
    ...buildDurationMeta(learningUnit.duration_hours),
    { label: 'Teme', value: learningUnit.content_topics.length },
    {
      label: 'Vprašanja za samooceno',
      value: learningUnit.self_assessment_questions.length,
    },
    ...(parentModule ? [{ label: 'Modul', value: parentModule.title }] : []),
  ]
}

async function buildLearningPathView(
  learningPathId: string
): Promise<DetailViewState> {
  const [learningPath, userProgress] = await Promise.all([
    getLearningPathDetail(learningPathId) as Promise<LearningPathDetailResponse>,
    loadUserProgress(),
  ])

  const modules = learningPath.module_details ?? []

  return {
    targetType: 'learning_path',
    targetId: learningPathId,
    assistantContextType: 'learning_path',
    eyebrow: 'Učna pot',
    title: learningPath.title,
    description: learningPath.short_description,
    metaItems: buildLearningPathMeta(learningPath, modules),
    routeMapTitle: 'Struktura učne poti',
    routeMapDescription:
      'Moduli so prikazani glede na vrstni red, paralelne skupine, obveznost in predpogoje.',
    routeMapItems: buildLearningPathRouteMapItems({
      learningPath,
      modules,
      userProgress,
    }),
    assessmentUrl: buildAssessmentUrl('learning_path', learningPathId),
  }
}

async function buildModuleView(moduleId: string): Promise<DetailViewState> {
  const [module, userProgress] = await Promise.all([
    getModuleDetail(moduleId) as Promise<ModuleDetailResponse>,
    loadUserProgress(),
  ])

  const learningUnits = module.learning_unit_details ?? []
  const currentPosition = findCurrentPositionByModule(moduleId, userProgress)

  return {
    targetType: 'module',
    targetId: moduleId,
    assistantContextType: 'module',
    eyebrow: 'Modul',
    title: module.title,
    description: module.short_description,
    metaItems: buildModuleMeta(module, learningUnits),
    tagsSection: {
      title: 'Področja',
      description: 'Področja, ki jih pokriva ta modul.',
      tags: module.domains,
      emptyMessage: 'Ta modul nima dodanih področij.',
    },
    routeMapTitle: 'Učne enote v modulu',
    routeMapDescription:
      'Učne enote so prikazane glede na vrstni red, paralelne skupine, obveznost in predpogoje.',
    routeMapItems: buildModuleRouteMapItems({
      module,
      learningUnits,
      currentPosition,
      userProgress,
    }),
    assessmentUrl: buildAssessmentUrl('module', moduleId),
  }
}

async function findLearningUnitContext(
  learningUnitId: string
): Promise<{
  parentModule: ModuleDetailResponse | null
  parentLearningPath: LearningPathResponse | null
  parentLearningUnits: LearningUnitResponse[]
}> {
  const [modules, learningPaths] = await Promise.all([
    getModules(),
    getLearningPaths(),
  ])

  const parentModulePreview =
    modules.find((moduleItem) =>
      moduleItem.learning_units.some(
        (reference) => reference.learning_unit_id === learningUnitId
      )
    ) ?? null

  const parentModuleId = parentModulePreview
    ? getResponseId(parentModulePreview)
    : null

  const parentModule = parentModuleId
    ? ((await getModuleDetail(parentModuleId)) as ModuleDetailResponse)
    : null

  const parentLearningPath = parentModuleId
    ? learningPaths.find((learningPath) =>
      learningPath.steps.some(
        (reference) =>
          (reference.type === 'module' || reference.step_type === 'module') &&
          reference.module_id === parentModuleId
      )
    ) ?? null
    : null

  const parentLearningUnits = parentModule?.learning_unit_details ?? []

  return {
    parentModule,
    parentLearningPath,
    parentLearningUnits,
  }
}

async function buildLearningUnitView(
  learningUnitId: string
): Promise<DetailViewState> {
  const [learningUnit, userProgress] = await Promise.all([
    getLearningUnitDetail(learningUnitId),
    loadUserProgress(),
  ])

  const { parentModule, parentLearningPath, parentLearningUnits } =
    await findLearningUnitContext(learningUnitId)

  const currentPosition = findCurrentPositionByLearningUnit(
    learningUnitId,
    parentModule ? getResponseId(parentModule) : undefined,
    parentLearningPath ? getResponseId(parentLearningPath) : undefined,
    userProgress
  )

  const routeMapItems = parentModule
    ? buildModuleRouteMapItems({
      module: parentModule,
      learningUnits: parentLearningUnits,
      currentPosition,
      userProgress,
    })
    : []

  const routeMapDescription = parentModule
    ? `Učna enota je prikazana v kontekstu modula "${parentModule.title}".`
    : 'Za to učno enoto ni bilo mogoče najti pripadajočega modula.'

  return {
    targetType: 'learning_unit',
    targetId: learningUnitId,
    assistantContextType: 'learning_unit',
    eyebrow: 'Učna enota',
    title: learningUnit.title,
    description: learningUnit.short_description,
    metaItems: buildLearningUnitMeta(learningUnit, parentModule),
    tagsSection: {
      title: 'Teme',
      description: 'Vsebinske teme, ki jih pokriva ta učna enota.',
      tags: getTopicTitles(learningUnit),
      emptyMessage: 'Ta učna enota nima dodanih vsebinskih tem.',
    },
    routeMapTitle: 'Kontekst učne enote',
    routeMapDescription,
    routeMapItems,
    assessmentUrl: buildAssessmentUrl('learning_unit', learningUnitId),
  }
}

export async function buildDetailViewState(
  targetInfo: DetailTargetInfo
): Promise<DetailViewState> {
  if (targetInfo.type === 'learning_path') {
    return buildLearningPathView(targetInfo.id)
  }

  if (targetInfo.type === 'module') {
    return buildModuleView(targetInfo.id)
  }

  return buildLearningUnitView(targetInfo.id)
}