from pydantic import BaseModel, Field, ConfigDict


class CompetencyReference(BaseModel):
    competency_id: str

#Ne vključim questionnaire, ker ga bom vračala posebej.
class CompetencyGroupResponse(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    competencies: list[CompetencyReference]

    model_config = ConfigDict(populate_by_name=True)