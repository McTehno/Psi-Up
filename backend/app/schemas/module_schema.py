from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.learning_unit_schema import (
    LearningUnitReferenceResponse,
    LearningUnitResponse,
)


class ModuleResponse(BaseModel):
    """
    Shema za modul.

    Modul predstavlja večjo enoto učne vsebine.
    Sestavljen je iz več učnih enot.
    """

    id: str = Field(alias="_id")
    title: str
    short_description: str
    duration_hours: Optional[float] = None
    keywords: List[str] = Field(default_factory=list)
    domains: List[str] = Field(default_factory=list)
    learning_units: List[LearningUnitReferenceResponse] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class RecommendedLearningPathResponse(BaseModel):
    """
    Shema za kratek prikaz priporočene učne poti na detail strani modula.

    Uporablja se, ko želimo prikazati učne poti, ki vsebujejo izbrani modul.
    Ne vključuje steps seznama, ker frontend za ta prikaz potrebuje samo
    osnovne podatke o učni poti.
    """

    id: str = Field(alias="_id")
    title: str
    short_description: str
    duration_hours: Optional[float] = None
    keywords: List[str] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class ModuleDetailResponse(ModuleResponse):
    """
    Shema za detail prikaz modula.

    Razširi osnovni modul s podrobnostmi učnih enot in priporočenimi
    učnimi potmi, ki vsebujejo ta modul.
    Rezultat je namenjen detail strani modula.
    """

    learning_unit_details: List[LearningUnitResponse] = Field(default_factory=list)

    recommended_learning_paths: List[RecommendedLearningPathResponse] = Field(
        default_factory=list
    )


class ModuleReferenceResponse(BaseModel):
    """
    Združljivostna shema za referenco modula.

    V novi strukturi learning_paths.json učna pot uporablja steps,
    kjer je posamezen korak lahko module ali learning_unit.

    Ta shema lahko začasno ostane zaradi starejših service/repository delov,
    dokler celotna backend logika ni prestavljena na LearningPathStepReference.
    """

    module_id: str
    order: Optional[int] = None
    parallel_group: Optional[str] = None
    is_required: bool = True
    prerequisites: List[str] = Field(default_factory=list)