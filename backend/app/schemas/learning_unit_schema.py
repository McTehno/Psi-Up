from pydantic import BaseModel, Field, ConfigDict


class LearningUnitResponse(BaseModel):
    id: str = Field(alias="_id")
    title: str
    content: str
    assessment_method: str
    instructor: str
    duration_min: int

    model_config = ConfigDict(populate_by_name=True)