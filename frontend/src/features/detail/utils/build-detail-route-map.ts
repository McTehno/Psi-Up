import type { DetailRouteItem } from '../../../components/detail/DetailRouteMap/DetailRouteMap'
import type {
  LearningPathResponse,
  LearningPathStepResponse,
} from '../../../types/learning-path'
import type {
  ModuleReferenceResponse,
  ModuleResponse,
} from '../../../types/module'
import type {
  LearningUnitReferenceResponse,
  LearningUnitResponse,
} from '../../../types/learning-unit'
import type {
  CurrentPositionResponse,
  UserProgressResponse,
} from '../../../types/user-progress'
import { getResponseId } from './get-response-id'

type BuildLearningPathRouteMapParams = {
  learningPath: LearningPathResponse
  modules: ModuleResponse[]
  userProgress?: UserProgressResponse | null
}

type BuildModuleRouteMapParams = {
  module: ModuleResponse
  learningUnits: LearningUnitResponse[]
  currentPosition?: CurrentPositionResponse | null
  userProgress?: UserProgressResponse | null
}

function findCurrentPosition(
  learningPathId: string,
  userProgress?: UserProgressResponse | null
) {
  return (
    userProgress?.current_positions.find(
      (position) => position.learning_path_id === learningPathId
    ) ?? null
  )
}

function getModuleStatus(
  moduleId: string,
  currentPosition?: CurrentPositionResponse | null,
  userProgress?: UserProgressResponse | null
): DetailRouteItem['status'] {
  if (currentPosition?.current_module_id === moduleId) {
    return 'current'
  }

  if (userProgress?.completed.module_ids.includes(moduleId)) {
    return 'completed'
  }

  return 'available'
}

function getLearningUnitStatus(
  learningUnitId: string,
  currentPosition?: CurrentPositionResponse | null,
  userProgress?: UserProgressResponse | null
): DetailRouteItem['status'] {
  if (currentPosition?.current_learning_unit_id === learningUnitId) {
    return 'current'
  }

  if (userProgress?.completed.learning_unit_ids.includes(learningUnitId)) {
    return 'completed'
  }

  return 'available'
}

function sortByOrder<T extends { order?: number | null }>(items: T[]) {
  return [...items].sort((firstItem, secondItem) => {
    const firstOrder = firstItem.order ?? Number.MAX_SAFE_INTEGER
    const secondOrder = secondItem.order ?? Number.MAX_SAFE_INTEGER

    return firstOrder - secondOrder
  })
}

function getLearningPathStepKind(step: LearningPathStepResponse) {
  return step.step_type ?? step.type ?? 'module'
}

function getLearningPathStepModuleId(step: LearningPathStepResponse) {
  return step.module_id ?? step.ref_id ?? null
}

function toModuleReference(
  step: LearningPathStepResponse,
): ModuleReferenceResponse | null {
  if (getLearningPathStepKind(step) !== 'module') {
    return null
  }

  const moduleId = getLearningPathStepModuleId(step)

  if (!moduleId) {
    return null
  }

  return {
    module_id: moduleId,
    order: step.order ?? null,
    parallel_group: step.parallel_group ?? null,
    is_required: step.is_required ?? false,
    prerequisites: step.prerequisites ?? [],
  }
}

function buildModuleRouteItem(
  reference: ModuleReferenceResponse,
  module: ModuleResponse,
  currentPosition?: CurrentPositionResponse | null,
  userProgress?: UserProgressResponse | null
): DetailRouteItem {
  return {
    id: reference.module_id,
    title: module.title,
    description: module.short_description,
    typeLabel: 'Modul',
    durationLabel: formatDuration(module.duration_hours),
    order: reference.order,
    parallelGroup: reference.parallel_group,
    isRequired: reference.is_required,
    prerequisites: reference.prerequisites,
    status: getModuleStatus(reference.module_id, currentPosition, userProgress),
  }
}

function buildLearningUnitRouteItem(
  reference: LearningUnitReferenceResponse,
  learningUnit: LearningUnitResponse,
  currentPosition?: CurrentPositionResponse | null,
  userProgress?: UserProgressResponse | null
): DetailRouteItem {
  return {
    id: reference.learning_unit_id,
    title: learningUnit.title,
    description: learningUnit.short_description,
    typeLabel: 'UÄŤna enota',
    durationLabel: formatDuration(learningUnit.duration_hours),
    order: reference.order,
    parallelGroup: reference.parallel_group,
    isRequired: reference.is_required,
    prerequisites: reference.prerequisites,
    status: getLearningUnitStatus(
      reference.learning_unit_id,
      currentPosition,
      userProgress
    ),
  }
}

export function buildLearningPathRouteMapItems({
  learningPath,
  modules,
  userProgress,
}: BuildLearningPathRouteMapParams): DetailRouteItem[] {
  const currentPosition = findCurrentPosition(
    getResponseId(learningPath),
    userProgress,
  )

  const stepModuleReferences = (learningPath.steps ?? [])
    .map(toModuleReference)
    .filter(
      (reference): reference is ModuleReferenceResponse =>
        reference !== null,
    )

  const fallbackModuleReferences = (learningPath.modules ?? [])
    .map((reference) => {
      if (!reference.module_id) {
        return null
      }

      return {
        ...reference,
        module_id: reference.module_id,
      }
    })
    .filter(
      (reference): reference is ModuleReferenceResponse =>
        reference !== null,
    )

  const moduleReferences =
    stepModuleReferences.length > 0
      ? stepModuleReferences
      : fallbackModuleReferences

  return sortByOrder(moduleReferences)
    .map((reference) => {
      const module = modules.find(
        (moduleItem) => getResponseId(moduleItem) === reference.module_id,
      )

      if (!module) {
        return null
      }

      return buildModuleRouteItem(
        reference,
        module,
        currentPosition,
        userProgress,
      )
    })
    .filter((item): item is DetailRouteItem => item !== null)
}

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

export function buildModuleRouteMapItems({
  module,
  learningUnits,
  currentPosition,
  userProgress,
}: BuildModuleRouteMapParams): DetailRouteItem[] {
  return sortByOrder(module.learning_units)
    .map((reference) => {
      const learningUnit = learningUnits.find(
        (learningUnitItem) =>
          getResponseId(learningUnitItem) === reference.learning_unit_id
      )

      if (!learningUnit) {
        return null
      }

      return buildLearningUnitRouteItem(
        reference,
        learningUnit,
        currentPosition,
        userProgress
      )
    })
    .filter((item): item is DetailRouteItem => item !== null)
}