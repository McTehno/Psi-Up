from pydantic import BaseModel, Field, ConfigDict


class ModulePrerequisiteResponse(BaseModel):
    module_id: str


class ModuleResponse(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    learning_units: list[str]
    competency_id: str
    prerequisites: list[ModulePrerequisiteResponse]

    model_config = ConfigDict(populate_by_name=True)