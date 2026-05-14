from pydantic import BaseModel


class GenerateLearningPathRequest(BaseModel):
    competency_id: str
    current_level: str


class LearningUnitResponse(BaseModel):
    id: str
    title: str
    content: str
    assessment_method: str
    instructor: str
    duration_min: int


class ModuleResponse(BaseModel):
    id: str
    title: str
    description: str
    learning_units: list[LearningUnitResponse]
    prerequisites: list[str]


class GeneratedLearningPathResponse(BaseModel):
    competency_id: str
    current_level: str
    title: str
    description: str
    source: str
    modules: list[ModuleResponse]