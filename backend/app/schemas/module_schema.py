from pydantic import BaseModel, Field, ConfigDict


class ModulePrerequisiteResponse(BaseModel):
    module_id: str


class LearningUnitReferenceResponse(BaseModel):
    learning_unit_id: str
    order: int


class ModuleResponse(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    learning_units: list[LearningUnitReferenceResponse]
    competency_id: str
    prerequisites: list[ModulePrerequisiteResponse]

    model_config = ConfigDict(populate_by_name=True)