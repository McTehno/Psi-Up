from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class SelfAssessmentQuestionResponse(BaseModel):
    """
    Shema za posamezno vprašanje za samooceno znotraj učne enote.
    """

    id: str
    question: str
    type: str = "yes_no"
    related_skill: Optional[str] = None


class LearningUnitResponse(BaseModel):
    """
    Shema za učno enoto.

    Učna enota je najmanjši del učne vsebine.
    V novi strukturi vsebuje tudi skills oziroma kompetence
    in vprašanja za samooceno.
    """

    id: str = Field(alias="_id")
    title: str
    short_description: str
    duration_min: Optional[int] = None
    keywords: List[str] = []
    skills: List[str] = []
    self_assessment_questions: List[SelfAssessmentQuestionResponse] = []

    model_config = ConfigDict(populate_by_name=True)


class LearningUnitReferenceResponse(BaseModel):
    """
    Shema za referenco učne enote znotraj modula.

    Ta shema se uporablja v modules.json, kjer modul vsebuje seznam učnih enot.
    """

    learning_unit_id: str
    order: Optional[int] = None
    parallel_group: Optional[str] = None
    is_required: bool = True
    prerequisites: List[str] = []