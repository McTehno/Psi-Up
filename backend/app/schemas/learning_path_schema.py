from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.module_schema import ModuleReferenceResponse


class LearningPathResponse(BaseModel):
    """
    Shema za učno pot.

    Učna pot predstavlja celotno priporočeno ali izbrano učno zaporedje.
    V novi strukturi je učna pot sestavljena iz več modulov.
    """

    id: str = Field(alias="_id")
    title: str
    short_description: str
    duration_hours: Optional[float] = None
    keywords: List[str] = Field(default_factory=list)
    modules: List[ModuleReferenceResponse] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)