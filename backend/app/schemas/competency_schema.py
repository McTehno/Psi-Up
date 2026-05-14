from pydantic import BaseModel, Field, ConfigDict


#Kako izgleda kompetenca v odgovoru

class CompetencyResponse(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    level: str

    model_config = ConfigDict(populate_by_name=True)