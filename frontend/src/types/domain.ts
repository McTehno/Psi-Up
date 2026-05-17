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
