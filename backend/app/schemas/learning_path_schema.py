from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class LearningPathStepReference(BaseModel):
    """
    Shema za en korak znotraj učne poti.

    Korak je lahko modul ali samostojna učna enota.
    """

    type: Literal["module", "learning_unit"]
    ref_id: str
    order: int
    parallel_group: Optional[str] = None
    is_required: bool = True
    prerequisites: List[str] = Field(default_factory=list)


class LearningPathResponse(BaseModel):
    """
    Shema za učno pot.

    Učna pot predstavlja celotno priporočeno ali izbrano učno zaporedje.
    V novi strukturi je učna pot sestavljena iz zaporedja korakov.
    Korak je lahko modul ali samostojna učna enota.
    """

    id: str = Field(alias="_id")
    title: str
    short_description: str
    duration_hours: Optional[float] = None
    keywords: List[str] = Field(default_factory=list)
    steps: List[LearningPathStepReference] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)