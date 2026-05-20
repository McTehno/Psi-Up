import type { ModuleReferenceResponse } from './module'

export type LearningPathResponse = {
  id: string
  title: string
  short_description: string
  duration_min?: number | null
  keywords: string[]
  modules: ModuleReferenceResponse[]
}