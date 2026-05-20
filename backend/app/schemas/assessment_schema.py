from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.questionnaire_schema import QuestionnaireTargetType


class AssessmentStatus(str, Enum):
    """
    Enum za status rezultata ocenjevanja.
    """

    COMPLETED = "completed"
    PARTIALLY_COMPLETED = "partially_completed"
    NOT_STARTED = "not_started"


class LearningUnitAssessmentResult(BaseModel):
    """
    Shema za rezultat ocenjevanja posamezne učne enote.

    Uporabi se za določanje, ali uporabnik določeno učno enoto že zna
    ali jo mora še opraviti.
    """

    learning_unit_id: str
    known_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    is_completed_by_assessment: bool = False


class ModuleAssessmentResult(BaseModel):
    """
    Shema za rezultat ocenjevanja posameznega modula.

    Modul je lahko ocenjen kot že opravljen, delno opravljen
    ali še nezačet.
    """

    module_id: str
    status: AssessmentStatus = AssessmentStatus.NOT_STARTED
    completed_learning_units: List[str] = Field(default_factory=list)
    missing_learning_units: List[str] = Field(default_factory=list)


class AssessmentResultResponse(BaseModel):
    """
    Shema za celoten rezultat vprašalnika.

    Rezultat določi, kje naj uporabnik začne glede na njegove odgovore.
    """

    user_id: str
    target_type: QuestionnaireTargetType
    target_id: str

    start_module_id: Optional[str] = None
    start_learning_unit_id: Optional[str] = None

    skipped_modules: List[str] = Field(default_factory=list)
    skipped_learning_units: List[str] = Field(default_factory=list)

    recommended_next_modules: List[str] = Field(default_factory=list)
    recommended_next_learning_units: List[str] = Field(default_factory=list)

    learning_unit_results: List[LearningUnitAssessmentResult] = Field(default_factory=list)
    module_results: List[ModuleAssessmentResult] = Field(default_factory=list)

    summary: Optional[str] = None