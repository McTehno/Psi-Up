export interface Module {
  id: string;
  order: number;
  title: string;
  description: string;
  learningUnitsCount: number;
}

export interface LearningPathData {
  pathTitle: string;
  pathDescription: string;
  targetCompetency: string;
  modules: Module[];
}

export type SearchResult = {
	id: string
	type: 'learning_path' | 'module' | 'learning_unit'
	title: string
	short_description?: string
	keywords?: string[]
}
